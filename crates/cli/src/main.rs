mod build;
mod manifest;
mod markdown;
mod serve;
mod sitemap;
mod template;

use anyhow::Result;
use clap::{Parser, Subcommand};
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "ef", about = "every-fail blog system", version)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    #[command(about = "Build the site")]
    Build {
        #[arg(long, help = "Full rebuild (ignore manifest)")]
        full: bool,
    },
    #[command(about = "Start local development server")]
    Serve {
        #[arg(short, long, default_value = "3000", help = "Port to listen on")]
        port: u16,
    },
    #[command(about = "Create a new article")]
    New {
        #[arg(short, long, help = "Article title")]
        title: Option<String>,
    },
    #[command(about = "Deploy to Cloudflare Workers")]
    Deploy {
        #[arg(long, help = "Show what would be deployed without deploying")]
        dry_run: bool,
    },
}

fn resolve_project_dir() -> Result<PathBuf> {
    let config_path = dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("~/.config"))
        .join("ef")
        .join("main.toml");

    if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)?;
        let config: toml::Value = content.parse()?;
        if let Some(dir) = config.get("project_dir").and_then(|v| v.as_str()) {
            return Ok(PathBuf::from(dir));
        }
    }

    let cwd = std::env::current_dir()?;
    if cwd.join("crates").exists() && cwd.join("articles").exists() {
        return Ok(cwd);
    }

    let mut dir = cwd.as_path();
    while let Some(parent) = dir.parent() {
        if parent.join("crates").exists() && parent.join("articles").exists() {
            return Ok(parent.to_path_buf());
        }
        dir = parent;
    }

    anyhow::bail!("Project directory not found. Set project_dir in ~/.config/ef/main.toml or run from project root.")
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    let project_dir = resolve_project_dir()?;

    match cli.command {
        Commands::Build { full: _ } => {
            build::run(&project_dir)?;
        }
        Commands::Serve { port } => {
            serve::run(&project_dir, port).await?;
        }
        Commands::New { title } => {
            new_article(&project_dir, title)?;
        }
        Commands::Deploy { dry_run } => {
            deploy(dry_run)?;
        }
    }

    Ok(())
}

fn new_article(project_dir: &PathBuf, title: Option<String>) -> Result<()> {
    let id = uuid::Uuid::now_v7();
    let article_dir = project_dir.join("articles").join(id.to_string());
    std::fs::create_dir_all(&article_dir)?;

    let title_str = title.unwrap_or_else(|| "Untitled".to_string());
    let today = chrono::Local::now().format("%Y-%m-%d");

    let meta = format!(
        "title = \"{title_str}\"\ndate = {today}\ndescription = \"\"\ntags = []\ndraft = true\n"
    );
    std::fs::write(article_dir.join("meta.toml"), meta)?;
    std::fs::write(article_dir.join("index.md"), format!("# {title_str}\n"))?;

    println!("Created: articles/{id}/");
    println!("  → index.md");
    println!("  → meta.toml");

    Ok(())
}

fn deploy(dry_run: bool) -> Result<()> {
    if dry_run {
        println!("Dry run: would deploy dist/ to Cloudflare Workers");
    } else {
        println!("Deploy is not yet implemented (Phase 1 placeholder)");
    }
    Ok(())
}
