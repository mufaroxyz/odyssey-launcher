use serde::{Deserialize, Serialize};

use std::fmt::{Debug, Display, Formatter};

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct Version {
    pub version: [u8; 3],
}

impl Version {
    #[inline]
    pub fn new(a: u8, b: u8, c: u8) -> Self {
        Self { version: [a, b, c] }
    }

    #[allow(clippy::should_implement_trait)]
    /// Get `Version` from the string
    ///
    /// ```
    /// use anime_game_core::prelude::Version;
    ///
    /// let version = Version::from_str("1.10.2").expect("Failed to parse version string");
    /// ```
    pub fn from_str<T: AsRef<str>>(str: T) -> Option<Self> {
        let parts = str.as_ref().split('.').collect::<Vec<&str>>();

        if parts.len() != 3 {
            return None;
        }

        if let (Ok(a), Ok(b), Ok(c)) = (parts[0].parse(), parts[1].parse(), parts[2].parse()) {
            return Some(Version::new(a, b, c));
        }

        None
    }

    /// Converts `Version` struct to plain format (e.g. "123")
    ///
    /// ```
    /// use anime_game_core::prelude::Version;
    ///
    /// assert_eq!(Version::new(1, 2, 3).to_plain_string(), "123");
    /// ```
    pub fn to_plain_string(&self) -> String {
        format!("{}{}{}", self.version[0], self.version[1], self.version[2])
    }
}

impl Debug for Version {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}.{}.{}",
            self.version[0], self.version[1], self.version[2]
        )
    }
}

impl Display for Version {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}.{}.{}",
            self.version[0], self.version[1], self.version[2]
        )
    }
}

impl PartialEq<String> for Version {
    #[inline]
    fn eq(&self, other: &String) -> bool {
        &self.to_string() == other
    }
}

impl PartialEq<Version> for String {
    #[inline]
    fn eq(&self, other: &Version) -> bool {
        self == &other.to_string()
    }
}

impl PartialEq<&str> for Version {
    #[inline]
    fn eq(&self, other: &&str) -> bool {
        &self.to_string() == other
    }
}

impl PartialEq<Version> for &str {
    #[inline]
    fn eq(&self, other: &Version) -> bool {
        self == &other.to_string()
    }
}
