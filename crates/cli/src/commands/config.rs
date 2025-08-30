use anyhow::Result;
use clap::Args;
use dirs::home_dir;
use std::fs;
use std::path::PathBuf;

#[derive(Args)]
pub struct ConfigCommand;

impl ConfigCommand {
    pub fn execute(&self) -> Result<()> {
        let config_path = get_config_path()?;

        if !config_path.exists() {
            anyhow::bail!("Configuration file not found at: {}", config_path.display());
        }

        let config_content = fs::read_to_string(&config_path)?;
        let config: toml::Value = toml::from_str(&config_content)?;

        if let Some(path) = config.get("path") {
            println!("[path]");
            if let Some(daily) = path.get("daily") {
                println!("daily = {}", daily);
            }
        }

        Ok(())
    }
}

fn get_config_path() -> Result<PathBuf> {
    let home = home_dir().ok_or_else(|| anyhow::anyhow!("Could not find home directory"))?;
    Ok(home.join(".config").join("ef.toml"))
}
