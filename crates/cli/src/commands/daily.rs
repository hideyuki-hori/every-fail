use anyhow::Result;
use chrono::Local;
use clap::Args;
use dirs::home_dir;
use std::fs;
use std::path::PathBuf;

#[derive(Args)]
pub struct DailyCommand {
    #[arg(long = "new", help = "Create new daily folder")]
    pub new: bool,

    #[arg(short = 'd', long = "diary", help = "Create diary.md file")]
    pub diary: bool,

    #[arg(short = 'm', long = "metrics", help = "Create metrics.yml file")]
    pub metrics: bool,
}

impl DailyCommand {
    pub fn execute(&self) -> Result<()> {
        if !self.new && !self.diary && !self.metrics {
            let daily_dir = get_daily_base_dir()?;
            std::process::Command::new("code").arg(&daily_dir).spawn()?;
            return Ok(());
        }

        let daily_dir = get_today_daily_dir()?;

        if self.new {
            create_daily_folder(&daily_dir)?;
        }

        if self.diary {
            create_diary_file(&daily_dir)?;
        }

        if self.metrics {
            create_metrics_file(&daily_dir)?;
        }

        Ok(())
    }
}

fn get_daily_base_dir() -> Result<PathBuf> {
    let home = home_dir().ok_or_else(|| anyhow::anyhow!("Could not find home directory"))?;
    let config_path = home.join(".config").join("ef.toml");

    if config_path.exists() {
        let config_content = fs::read_to_string(&config_path)?;
        let config: toml::Value = toml::from_str(&config_content)?;

        if let Some(path) = config.get("path") {
            if let Some(daily) = path.get("daily") {
                if let Some(daily_str) = daily.as_str() {
                    if daily_str.starts_with("~/") {
                        return Ok(home.join(&daily_str[2..]));
                    }
                    return Ok(PathBuf::from(daily_str));
                }
            }
        }
    }

    Ok(home.join("h").join("daily"))
}

fn get_today_daily_dir() -> Result<PathBuf> {
    let base_dir = get_daily_base_dir()?;
    let now = Local::now();

    Ok(base_dir
        .join(now.format("%Y").to_string())
        .join(now.format("%m").to_string())
        .join(now.format("%d").to_string()))
}

fn create_daily_folder(daily_dir: &PathBuf) -> Result<()> {
    if !daily_dir.exists() {
        fs::create_dir_all(daily_dir)?;
        println!("Created: {}", daily_dir.display());
    } else {
        println!("Already exists: {}", daily_dir.display());
    }
    Ok(())
}

fn create_diary_file(daily_dir: &PathBuf) -> Result<()> {
    if !daily_dir.exists() {
        fs::create_dir_all(daily_dir)?;
    }

    let diary_path = daily_dir.join("diary.md");
    if !diary_path.exists() {
        fs::write(&diary_path, "")?;
        println!("Created: {}", diary_path.display());
    } else {
        println!("Already exists: {}", diary_path.display());
    }
    Ok(())
}

fn create_metrics_file(daily_dir: &PathBuf) -> Result<()> {
    if !daily_dir.exists() {
        fs::create_dir_all(daily_dir)?;
    }

    let metrics_path = daily_dir.join("metrics.yml");
    if !metrics_path.exists() {
        let template = "";
        let now = Local::now();
        let content = template.replace("{}", &now.format("%Y-%m-%d").to_string());

        fs::write(&metrics_path, content)?;
        println!("Created: {}", metrics_path.display());
    } else {
        println!("Already exists: {}", metrics_path.display());
    }
    Ok(())
}
