use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};

use crate::manifest::Manifest;
use crate::markdown;
use crate::sitemap::{self, SitemapEntry};
use crate::template;

const BASE_URL: &str = "https://every.fail";

#[derive(Deserialize)]
struct MetaToml {
    title: String,
    date: toml::value::Date,
    description: String,
    tags: Vec<String>,
    #[serde(default)]
    draft: bool,
}

#[derive(Serialize)]
struct ArticleMeta {
    id: String,
    title: String,
    date: String,
    description: String,
    tags: Vec<String>,
}

struct Article {
    id: String,
    meta: MetaToml,
    html_fragment: String,
    dir: PathBuf,
}

pub fn run(project_dir: &Path) -> Result<()> {
    let dist_dir = project_dir.join("dist");
    let articles_dir = project_dir.join("articles");
    let templates_dir = project_dir.join("templates");
    let web_out_dir = project_dir.join("web").join("out");

    if dist_dir.exists() {
        std::fs::remove_dir_all(&dist_dir)?;
    }
    std::fs::create_dir_all(&dist_dir)?;
    std::fs::create_dir_all(dist_dir.join("assets"))?;

    let shell_template = std::fs::read_to_string(templates_dir.join("shell.html"))
        .context("Failed to read templates/shell.html")?;
    let post_template = std::fs::read_to_string(templates_dir.join("post.html"))
        .context("Failed to read templates/post.html")?;
    let index_template = std::fs::read_to_string(templates_dir.join("index.html"))
        .context("Failed to read templates/index.html")?;

    let js_file = read_js_filename(project_dir);

    let mut articles = Vec::new();

    if articles_dir.exists() {
        let mut entries: Vec<_> = std::fs::read_dir(&articles_dir)?
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().map(|ft| ft.is_dir()).unwrap_or(false))
            .collect();
        entries.sort_by_key(|e| e.file_name());

        for entry in entries {
            let dir = entry.path();
            let id = entry.file_name().to_string_lossy().to_string();

            let meta_path = dir.join("meta.toml");
            if !meta_path.exists() {
                continue;
            }

            let meta_content = std::fs::read_to_string(&meta_path)
                .with_context(|| format!("Failed to read {}", meta_path.display()))?;
            let meta: MetaToml = toml::from_str(&meta_content)
                .with_context(|| format!("Failed to parse {}", meta_path.display()))?;

            if meta.draft {
                continue;
            }

            let md_path = dir.join("index.md");
            let md_content = std::fs::read_to_string(&md_path)
                .with_context(|| format!("Failed to read {}", md_path.display()))?;

            let html_fragment = markdown::render(&md_content, &id);

            articles.push(Article {
                id,
                meta,
                html_fragment,
                dir,
            });
        }
    }

    articles.sort_by(|a, b| b.meta.date.to_string().cmp(&a.meta.date.to_string()));

    let mut manifest = Manifest::default();
    let mut sitemap_entries = Vec::new();

    for article in &articles {
        let date_str = article.meta.date.to_string();
        let article_dist = dist_dir.join(&article.id);
        std::fs::create_dir_all(&article_dist)?;

        let meta_json = ArticleMeta {
            id: article.id.clone(),
            title: article.meta.title.clone(),
            date: date_str.clone(),
            description: article.meta.description.clone(),
            tags: article.meta.tags.clone(),
        };
        let meta_json_str = serde_json::to_string_pretty(&meta_json)?;
        std::fs::write(article_dist.join("meta.json"), &meta_json_str)?;
        manifest.record(
            &format!("{}/meta.json", article.id),
            meta_json_str.as_bytes(),
        );

        copy_article_assets(article, &dist_dir)?;

        let tags_html = article
            .meta
            .tags
            .iter()
            .map(|t| {
                format!(
                    "<span data-tag=\"{t}\" style=\"display:inline-block;padding:0.15rem 0.5rem;border-radius:4px;font-size:0.8rem;background:#524E44;color:#F4F2ED;\">{t}</span>"
                )
            })
            .collect::<Vec<_>>()
            .join("\n");

        let mut post_vars: HashMap<&str, String> = HashMap::new();
        post_vars.insert("title", article.meta.title.clone());
        post_vars.insert("date", date_str.clone());
        post_vars.insert("description", article.meta.description.clone());
        post_vars.insert("tags", tags_html);
        post_vars.insert("content", article.html_fragment.clone());

        let post_content = template::render(&post_template, &post_vars);

        let post_style = r#"<style>
.post-body h1 { font-size: 1.6rem; margin: 2rem 0 1rem; }
.post-body h2 { font-size: 1.3rem; margin: 1.8rem 0 0.8rem; }
.post-body h3 { font-size: 1.1rem; margin: 1.5rem 0 0.6rem; }
.post-body p { margin: 0.8rem 0; }
.post-body ul, .post-body ol { margin: 0.8rem 0; padding-left: 1.5rem; }
.post-body li { margin: 0.3rem 0; }
.post-body code { background: #524E44; padding: 0.15rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
.post-body pre { background: #524E44; padding: 1rem; border-radius: 6px; overflow-x: auto; margin: 1rem 0; }
.post-body pre code { background: none; padding: 0; }
.post-body strong { color: #ECEAE3; }
.post-body a { color: #D46020; }
.post-body img { max-width: 100%; border-radius: 6px; margin: 1rem 0; }
</style>"#;

        let mut shell_vars: HashMap<&str, String> = HashMap::new();
        shell_vars.insert("title", format!("{} | every.fail", article.meta.title));
        shell_vars.insert("content", post_content);
        shell_vars.insert("head", post_style.to_string());
        shell_vars.insert("js_file", js_file.clone());

        let full_html = template::render(&shell_template, &shell_vars);

        std::fs::write(article_dist.join("index.html"), &full_html)?;
        manifest.record(
            &format!("{}/index.html", article.id),
            full_html.as_bytes(),
        );

        sitemap_entries.push(SitemapEntry {
            loc: format!("{BASE_URL}/{}", article.id),
            lastmod: date_str,
        });
    }

    let article_list_html = build_article_list_html(&articles);
    let mut index_vars: HashMap<&str, String> = HashMap::new();
    index_vars.insert("article_list", article_list_html);
    let index_content = template::render(&index_template, &index_vars);

    let index_style = r#"<style>
.article-list a { text-decoration: none; color: inherit; display: block; }
.article-item { padding: 1.2rem; border-radius: 8px; margin-bottom: 1rem; transition: background 0.15s; }
.article-item:hover { background: rgba(255,255,255,0.05); }
.article-item h2 { font-size: 1.2rem; color: #F4F2ED; margin-bottom: 0.3rem; }
.article-item p { color: #918C7E; font-size: 0.9rem; margin-bottom: 0.3rem; }
.article-item time { color: #706B5F; font-size: 0.8rem; }
</style>"#;

    let mut shell_vars: HashMap<&str, String> = HashMap::new();
    shell_vars.insert("title", "every.fail".to_string());
    shell_vars.insert("content", index_content);
    shell_vars.insert("head", index_style.to_string());
    shell_vars.insert("js_file", js_file.clone());
    let index_html = template::render(&shell_template, &shell_vars);
    std::fs::write(dist_dir.join("index.html"), &index_html)?;
    manifest.record("index.html", index_html.as_bytes());

    if web_out_dir.exists() {
        copy_dir_recursive(&web_out_dir, &dist_dir.join("assets"))?;
        println!("Copied web/out/ → dist/assets/");
    }

    sitemap::write_sitemap(&dist_dir, BASE_URL, &sitemap_entries)?;

    manifest.save(&dist_dir)?;

    println!(
        "Built {} article(s) → dist/",
        articles.len()
    );

    Ok(())
}

fn copy_article_assets(article: &Article, dist_dir: &Path) -> Result<()> {
    let asset_dir = dist_dir.join(&article.id);

    for entry in std::fs::read_dir(&article.dir)? {
        let entry = entry?;
        let name = entry.file_name().to_string_lossy().to_string();
        if name == "index.md" || name == "meta.toml" {
            continue;
        }
        let src = entry.path();
        if src.is_file() {
            std::fs::create_dir_all(&asset_dir)?;
            std::fs::copy(&src, asset_dir.join(&name))?;
        }
    }

    Ok(())
}

fn build_article_list_html(articles: &[Article]) -> String {
    let mut html = String::new();
    for article in articles {
        let date_str = article.meta.date.to_string();
        let tags: String = article
            .meta
            .tags
            .iter()
            .map(|t| {
                format!(
                    "<span data-tag=\"{t}\" style=\"display:inline-block;padding:0.1rem 0.4rem;border-radius:3px;font-size:0.75rem;background:#524E44;color:#F4F2ED;margin-right:0.3rem;\">{t}</span>"
                )
            })
            .collect::<Vec<_>>()
            .join("");

        html.push_str(&format!(
            "<a href=\"/{id}\">\n<div class=\"article-item\">\n<h2>{title}</h2>\n<p>{desc}</p>\n<div style=\"display:flex;align-items:center;gap:0.5rem;\"><time>{date}</time>{tags}</div>\n</div>\n</a>\n",
            id = article.id,
            title = article.meta.title,
            desc = article.meta.description,
            date = date_str,
            tags = tags,
        ));
    }
    html
}

fn read_js_filename(project_dir: &Path) -> String {
    let manifest_path = project_dir
        .join("web")
        .join("out")
        .join("manifest.json");
    if let Ok(content) = std::fs::read_to_string(&manifest_path) {
        if let Ok(manifest) = serde_json::from_str::<HashMap<String, String>>(&content) {
            if let Some(filename) = manifest.get("main.js") {
                return filename.clone();
            }
        }
    }
    "main.js".to_string()
}

fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<()> {
    std::fs::create_dir_all(dst)?;
    for entry in std::fs::read_dir(src)? {
        let entry = entry?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());
        if src_path.is_dir() {
            copy_dir_recursive(&src_path, &dst_path)?;
        } else {
            std::fs::copy(&src_path, &dst_path)?;
        }
    }
    Ok(())
}
