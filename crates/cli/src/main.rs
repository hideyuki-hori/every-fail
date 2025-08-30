use anyhow::Result;
use clap::Parser;
use std::env;

use cli::commands::Commands;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
#[command(name = "ef")]
#[command(about = "Every-fail creative assistant", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Some(Commands::Config(cmd)) => cmd.execute()?,
        Some(Commands::Daily(cmd)) => cmd.execute()?,
        None => {
            println!("version: {}", env!("CARGO_PKG_VERSION"));
            println!("which: {}", env::current_exe()?.display());
            println!();
            println!("usage: ef [OPTIONS] <COMMAND>");
            println!();
            println!("OPTIONS:");
            println!("    -h, --help      Print help information");
            println!("    -V, --version   Print version information");
            println!();
            println!("COMMANDS:");
            println!("    config    Configuration management");
            println!("    daily     Daily entry management");
        }
    }

    Ok(())
}
