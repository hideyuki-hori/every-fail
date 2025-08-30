pub mod config;
pub mod daily;

use clap::Subcommand;

#[derive(Subcommand)]
pub enum Commands {
    #[command(about = "Configuration management")]
    Config(config::ConfigCommand),

    #[command(about = "Daily entry management")]
    Daily(daily::DailyCommand),
}
