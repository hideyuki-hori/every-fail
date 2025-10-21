use crate::colors::Color;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Palette {
    pub slate: HashMap<String, Color>,
    pub gray: HashMap<String, Color>,
    pub zinc: HashMap<String, Color>,
    pub neutral: HashMap<String, Color>,
    pub stone: HashMap<String, Color>,
    pub red: HashMap<String, Color>,
    pub orange: HashMap<String, Color>,
    pub amber: HashMap<String, Color>,
    pub yellow: HashMap<String, Color>,
    pub lime: HashMap<String, Color>,
    pub green: HashMap<String, Color>,
    pub emerald: HashMap<String, Color>,
    pub teal: HashMap<String, Color>,
    pub cyan: HashMap<String, Color>,
    pub sky: HashMap<String, Color>,
    pub blue: HashMap<String, Color>,
    pub indigo: HashMap<String, Color>,
    pub violet: HashMap<String, Color>,
    pub purple: HashMap<String, Color>,
    pub fuchsia: HashMap<String, Color>,
    pub pink: HashMap<String, Color>,
    pub rose: HashMap<String, Color>,
}

lazy_static::lazy_static! {
    static ref PALETTE: Palette = {
        let path = include_str!("./palette.toml");
        toml::from_str(path).expect("Failed to parse palette.toml")
    };
}

macro_rules! export_color {
    ($color_group:ident, $shade:literal, $const_name:ident) => {
        pub static $const_name: Color = Color::new(0, 0, 0); // Placeholder, will be initialized below
    };
}

export_color!(slate, "50", SLATE_50);
export_color!(slate, "100", SLATE_100);
export_color!(slate, "200", SLATE_200);
export_color!(slate, "300", SLATE_300);
export_color!(slate, "400", SLATE_400);
export_color!(slate, "500", SLATE_500);
export_color!(slate, "600", SLATE_600);
export_color!(slate, "700", SLATE_700);
export_color!(slate, "800", SLATE_800);
export_color!(slate, "900", SLATE_900);
export_color!(slate, "950", SLATE_950);

export_color!(gray, "50", GRAY_50);
export_color!(gray, "100", GRAY_100);
export_color!(gray, "200", GRAY_200);
export_color!(gray, "300", GRAY_300);
export_color!(gray, "400", GRAY_400);
export_color!(gray, "500", GRAY_500);
export_color!(gray, "600", GRAY_600);
export_color!(gray, "700", GRAY_700);
export_color!(gray, "800", GRAY_800);
export_color!(gray, "900", GRAY_900);
export_color!(gray, "950", GRAY_950);

export_color!(zinc, "50", ZINC_50);
export_color!(zinc, "100", ZINC_100);
export_color!(zinc, "200", ZINC_200);
export_color!(zinc, "300", ZINC_300);
export_color!(zinc, "400", ZINC_400);
export_color!(zinc, "500", ZINC_500);
export_color!(zinc, "600", ZINC_600);
export_color!(zinc, "700", ZINC_700);
export_color!(zinc, "800", ZINC_800);
export_color!(zinc, "900", ZINC_900);
export_color!(zinc, "950", ZINC_950);

export_color!(neutral, "50", NEUTRAL_50);
export_color!(neutral, "100", NEUTRAL_100);
export_color!(neutral, "200", NEUTRAL_200);
export_color!(neutral, "300", NEUTRAL_300);
export_color!(neutral, "400", NEUTRAL_400);
export_color!(neutral, "500", NEUTRAL_500);
export_color!(neutral, "600", NEUTRAL_600);
export_color!(neutral, "700", NEUTRAL_700);
export_color!(neutral, "800", NEUTRAL_800);
export_color!(neutral, "900", NEUTRAL_900);
export_color!(neutral, "950", NEUTRAL_950);

export_color!(stone, "50", STONE_50);
export_color!(stone, "100", STONE_100);
export_color!(stone, "200", STONE_200);
export_color!(stone, "300", STONE_300);
export_color!(stone, "400", STONE_400);
export_color!(stone, "500", STONE_500);
export_color!(stone, "600", STONE_600);
export_color!(stone, "700", STONE_700);
export_color!(stone, "800", STONE_800);
export_color!(stone, "900", STONE_900);
export_color!(stone, "950", STONE_950);

export_color!(red, "50", RED_50);
export_color!(red, "100", RED_100);
export_color!(red, "200", RED_200);
export_color!(red, "300", RED_300);
export_color!(red, "400", RED_400);
export_color!(red, "500", RED_500);
export_color!(red, "600", RED_600);
export_color!(red, "700", RED_700);
export_color!(red, "800", RED_800);
export_color!(red, "900", RED_900);
export_color!(red, "950", RED_950);

export_color!(orange, "50", ORANGE_50);
export_color!(orange, "100", ORANGE_100);
export_color!(orange, "200", ORANGE_200);
export_color!(orange, "300", ORANGE_300);
export_color!(orange, "400", ORANGE_400);
export_color!(orange, "500", ORANGE_500);
export_color!(orange, "600", ORANGE_600);
export_color!(orange, "700", ORANGE_700);
export_color!(orange, "800", ORANGE_800);
export_color!(orange, "900", ORANGE_900);
export_color!(orange, "950", ORANGE_950);

export_color!(amber, "50", AMBER_50);
export_color!(amber, "100", AMBER_100);
export_color!(amber, "200", AMBER_200);
export_color!(amber, "300", AMBER_300);
export_color!(amber, "400", AMBER_400);
export_color!(amber, "500", AMBER_500);
export_color!(amber, "600", AMBER_600);
export_color!(amber, "700", AMBER_700);
export_color!(amber, "800", AMBER_800);
export_color!(amber, "900", AMBER_900);
export_color!(amber, "950", AMBER_950);

export_color!(yellow, "50", YELLOW_50);
export_color!(yellow, "100", YELLOW_100);
export_color!(yellow, "200", YELLOW_200);
export_color!(yellow, "300", YELLOW_300);
export_color!(yellow, "400", YELLOW_400);
export_color!(yellow, "500", YELLOW_500);
export_color!(yellow, "600", YELLOW_600);
export_color!(yellow, "700", YELLOW_700);
export_color!(yellow, "800", YELLOW_800);
export_color!(yellow, "900", YELLOW_900);
export_color!(yellow, "950", YELLOW_950);

export_color!(lime, "50", LIME_50);
export_color!(lime, "100", LIME_100);
export_color!(lime, "200", LIME_200);
export_color!(lime, "300", LIME_300);
export_color!(lime, "400", LIME_400);
export_color!(lime, "500", LIME_500);
export_color!(lime, "600", LIME_600);
export_color!(lime, "700", LIME_700);
export_color!(lime, "800", LIME_800);
export_color!(lime, "900", LIME_900);
export_color!(lime, "950", LIME_950);

export_color!(green, "50", GREEN_50);
export_color!(green, "100", GREEN_100);
export_color!(green, "200", GREEN_200);
export_color!(green, "300", GREEN_300);
export_color!(green, "400", GREEN_400);
export_color!(green, "500", GREEN_500);
export_color!(green, "600", GREEN_600);
export_color!(green, "700", GREEN_700);
export_color!(green, "800", GREEN_800);
export_color!(green, "900", GREEN_900);
export_color!(green, "950", GREEN_950);

export_color!(emerald, "50", EMERALD_50);
export_color!(emerald, "100", EMERALD_100);
export_color!(emerald, "200", EMERALD_200);
export_color!(emerald, "300", EMERALD_300);
export_color!(emerald, "400", EMERALD_400);
export_color!(emerald, "500", EMERALD_500);
export_color!(emerald, "600", EMERALD_600);
export_color!(emerald, "700", EMERALD_700);
export_color!(emerald, "800", EMERALD_800);
export_color!(emerald, "900", EMERALD_900);
export_color!(emerald, "950", EMERALD_950);

export_color!(teal, "50", TEAL_50);
export_color!(teal, "100", TEAL_100);
export_color!(teal, "200", TEAL_200);
export_color!(teal, "300", TEAL_300);
export_color!(teal, "400", TEAL_400);
export_color!(teal, "500", TEAL_500);
export_color!(teal, "600", TEAL_600);
export_color!(teal, "700", TEAL_700);
export_color!(teal, "800", TEAL_800);
export_color!(teal, "900", TEAL_900);
export_color!(teal, "950", TEAL_950);

export_color!(cyan, "50", CYAN_50);
export_color!(cyan, "100", CYAN_100);
export_color!(cyan, "200", CYAN_200);
export_color!(cyan, "300", CYAN_300);
export_color!(cyan, "400", CYAN_400);
export_color!(cyan, "500", CYAN_500);
export_color!(cyan, "600", CYAN_600);
export_color!(cyan, "700", CYAN_700);
export_color!(cyan, "800", CYAN_800);
export_color!(cyan, "900", CYAN_900);
export_color!(cyan, "950", CYAN_950);

export_color!(sky, "50", SKY_50);
export_color!(sky, "100", SKY_100);
export_color!(sky, "200", SKY_200);
export_color!(sky, "300", SKY_300);
export_color!(sky, "400", SKY_400);
export_color!(sky, "500", SKY_500);
export_color!(sky, "600", SKY_600);
export_color!(sky, "700", SKY_700);
export_color!(sky, "800", SKY_800);
export_color!(sky, "900", SKY_900);
export_color!(sky, "950", SKY_950);

export_color!(blue, "50", BLUE_50);
export_color!(blue, "100", BLUE_100);
export_color!(blue, "200", BLUE_200);
export_color!(blue, "300", BLUE_300);
export_color!(blue, "400", BLUE_400);
export_color!(blue, "500", BLUE_500);
export_color!(blue, "600", BLUE_600);
export_color!(blue, "700", BLUE_700);
export_color!(blue, "800", BLUE_800);
export_color!(blue, "900", BLUE_900);
export_color!(blue, "950", BLUE_950);

export_color!(indigo, "50", INDIGO_50);
export_color!(indigo, "100", INDIGO_100);
export_color!(indigo, "200", INDIGO_200);
export_color!(indigo, "300", INDIGO_300);
export_color!(indigo, "400", INDIGO_400);
export_color!(indigo, "500", INDIGO_500);
export_color!(indigo, "600", INDIGO_600);
export_color!(indigo, "700", INDIGO_700);
export_color!(indigo, "800", INDIGO_800);
export_color!(indigo, "900", INDIGO_900);
export_color!(indigo, "950", INDIGO_950);

export_color!(violet, "50", VIOLET_50);
export_color!(violet, "100", VIOLET_100);
export_color!(violet, "200", VIOLET_200);
export_color!(violet, "300", VIOLET_300);
export_color!(violet, "400", VIOLET_400);
export_color!(violet, "500", VIOLET_500);
export_color!(violet, "600", VIOLET_600);
export_color!(violet, "700", VIOLET_700);
export_color!(violet, "800", VIOLET_800);
export_color!(violet, "900", VIOLET_900);
export_color!(violet, "950", VIOLET_950);

export_color!(purple, "50", PURPLE_50);
export_color!(purple, "100", PURPLE_100);
export_color!(purple, "200", PURPLE_200);
export_color!(purple, "300", PURPLE_300);
export_color!(purple, "400", PURPLE_400);
export_color!(purple, "500", PURPLE_500);
export_color!(purple, "600", PURPLE_600);
export_color!(purple, "700", PURPLE_700);
export_color!(purple, "800", PURPLE_800);
export_color!(purple, "900", PURPLE_900);
export_color!(purple, "950", PURPLE_950);

export_color!(fuchsia, "50", FUCHSIA_50);
export_color!(fuchsia, "100", FUCHSIA_100);
export_color!(fuchsia, "200", FUCHSIA_200);
export_color!(fuchsia, "300", FUCHSIA_300);
export_color!(fuchsia, "400", FUCHSIA_400);
export_color!(fuchsia, "500", FUCHSIA_500);
export_color!(fuchsia, "600", FUCHSIA_600);
export_color!(fuchsia, "700", FUCHSIA_700);
export_color!(fuchsia, "800", FUCHSIA_800);
export_color!(fuchsia, "900", FUCHSIA_900);
export_color!(fuchsia, "950", FUCHSIA_950);

export_color!(pink, "50", PINK_50);
export_color!(pink, "100", PINK_100);
export_color!(pink, "200", PINK_200);
export_color!(pink, "300", PINK_300);
export_color!(pink, "400", PINK_400);
export_color!(pink, "500", PINK_500);
export_color!(pink, "600", PINK_600);
export_color!(pink, "700", PINK_700);
export_color!(pink, "800", PINK_800);
export_color!(pink, "900", PINK_900);
export_color!(pink, "950", PINK_950);

export_color!(rose, "50", ROSE_50);
export_color!(rose, "100", ROSE_100);
export_color!(rose, "200", ROSE_200);
export_color!(rose, "300", ROSE_300);
export_color!(rose, "400", ROSE_400);
export_color!(rose, "500", ROSE_500);
export_color!(rose, "600", ROSE_600);
export_color!(rose, "700", ROSE_700);
export_color!(rose, "800", ROSE_800);
export_color!(rose, "900", ROSE_900);
export_color!(rose, "950", ROSE_950);

// Helper function to get color from palette
pub fn get_color(color_group: &str, shade: &str) -> Option<Color> {
    match color_group {
        "slate" => PALETTE.slate.get(shade).copied(),
        "gray" => PALETTE.gray.get(shade).copied(),
        "zinc" => PALETTE.zinc.get(shade).copied(),
        "neutral" => PALETTE.neutral.get(shade).copied(),
        "stone" => PALETTE.stone.get(shade).copied(),
        "red" => PALETTE.red.get(shade).copied(),
        "orange" => PALETTE.orange.get(shade).copied(),
        "amber" => PALETTE.amber.get(shade).copied(),
        "yellow" => PALETTE.yellow.get(shade).copied(),
        "lime" => PALETTE.lime.get(shade).copied(),
        "green" => PALETTE.green.get(shade).copied(),
        "emerald" => PALETTE.emerald.get(shade).copied(),
        "teal" => PALETTE.teal.get(shade).copied(),
        "cyan" => PALETTE.cyan.get(shade).copied(),
        "sky" => PALETTE.sky.get(shade).copied(),
        "blue" => PALETTE.blue.get(shade).copied(),
        "indigo" => PALETTE.indigo.get(shade).copied(),
        "violet" => PALETTE.violet.get(shade).copied(),
        "purple" => PALETTE.purple.get(shade).copied(),
        "fuchsia" => PALETTE.fuchsia.get(shade).copied(),
        "pink" => PALETTE.pink.get(shade).copied(),
        "rose" => PALETTE.rose.get(shade).copied(),
        _ => None,
    }
}

// Initialize all color constants from TOML
pub fn init_colors() {
    // This function would be called during initialization to set the actual values
    // For now, we'll use the get_color function to access colors
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_load_palette() {
        // Test that we can access colors from the loaded palette
        let red_500 = get_color("red", "500");
        assert!(red_500.is_some());
        
        let color = red_500.unwrap();
        assert_eq!(color.red, 239);
        assert_eq!(color.green, 68);
        assert_eq!(color.blue, 68);
    }
    
    #[test]
    fn test_color_validation() {
        let color = Color::new(255, 128, 0);
        assert!(color.validate());
    }
}