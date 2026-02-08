use std::path::Path;
use anyhow::Result;

pub struct SitemapEntry {
    pub loc: String,
    pub lastmod: String,
}

pub fn generate_sitemap(base_url: &str, entries: &[SitemapEntry]) -> String {
    let mut xml = String::from("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    xml.push_str("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

    let root = SitemapEntry {
        loc: base_url.to_string(),
        lastmod: entries
            .iter()
            .map(|e| e.lastmod.as_str())
            .max()
            .unwrap_or("2025-01-01")
            .to_string(),
    };

    xml.push_str(&format!(
        "  <url>\n    <loc>{}</loc>\n    <lastmod>{}</lastmod>\n  </url>\n",
        root.loc, root.lastmod
    ));

    for entry in entries {
        xml.push_str(&format!(
            "  <url>\n    <loc>{}</loc>\n    <lastmod>{}</lastmod>\n  </url>\n",
            entry.loc, entry.lastmod
        ));
    }

    xml.push_str("</urlset>\n");
    xml
}

pub fn generate_robots(base_url: &str) -> String {
    format!("User-agent: *\nAllow: /\n\nSitemap: {base_url}/sitemap.xml\n")
}

pub fn write_sitemap(dist_dir: &Path, base_url: &str, entries: &[SitemapEntry]) -> Result<()> {
    let sitemap = generate_sitemap(base_url, entries);
    std::fs::write(dist_dir.join("sitemap.xml"), sitemap)?;

    let robots = generate_robots(base_url);
    std::fs::write(dist_dir.join("robots.txt"), robots)?;

    Ok(())
}
