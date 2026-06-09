export type AmazonStyleGuideEvidence = {
  label: string;
  guidance: string;
  section: string;
  sourceFile: string;
};

export type AmazonCategoryRuleProfile = {
  titleMinChars?: number;
  titleMaxChars?: number;
  brandFirstExpected?: boolean;
  recommendedImageCount?: number;
  minLifestyleImages?: number;
  minDetailImages?: number;
  minInfographicImages?: number;
  allowedVariationThemes?: string[];
  browseSignalFloor?: number;
};

type AmazonStyleGuideProfile = {
  label: string;
  sourceFile: string;
  evidence: AmazonStyleGuideEvidence[];
};

const styleGuideProfiles: Record<string, AmazonStyleGuideProfile> = {
  automotive: {
    label: "Automotive & Powersports",
    sourceFile: "Style_guide_Automotive_Powersports_Final.pdf",
    evidence: [
      {
        label: "Fitment accuracy",
        guidance:
          "Fitment-dependent parts need structured year, make, model, and variant compatibility data instead of generic copy.",
        section: "About the Automotive & Powersports Part Finder",
        sourceFile: "Style_guide_Automotive_Powersports_Final.pdf",
      },
      {
        label: "Item-type precision",
        guidance:
          "Automotive listings should use the correct item-type keyword and browse path so the offer lands in the right parts flow.",
        section: "Item-Type Keyword",
        sourceFile: "Style_guide_Automotive_Powersports_Final.pdf",
      },
      {
        label: "Image quality",
        guidance:
          "The guide separates good and bad images explicitly, so incomplete or misleading visuals should be treated as approval risk.",
        section: "Images",
        sourceFile: "Style_guide_Automotive_Powersports_Final.pdf",
      },
    ],
  },
  baby: {
    label: "Baby",
    sourceFile: "Baby.pdf",
    evidence: [
      {
        label: "Core listing structure",
        guidance:
          "Baby listings are expected to follow clean title, brand, image, feature, and description structure before browse optimization.",
        section: "Overview",
        sourceFile: "Baby.pdf",
      },
      {
        label: "Variation discipline",
        guidance:
          "Size and color options belong in real variation relationships rather than mixed into titles or duplicated ASINs.",
        section: "Variation Relationships",
        sourceFile: "Baby.pdf",
      },
      {
        label: "Browse and search",
        guidance:
          "Discoverability depends on correct browse placement and item-type keywords, not only persuasive copy.",
        section: "Browse & Search",
        sourceFile: "Baby.pdf",
      },
    ],
  },
  beauty: {
    label: "Beauty & Personal Care",
    sourceFile: "Beauty.pdf",
    evidence: [
      {
        label: "Title discipline",
        guidance:
          "Titles should stay product-focused and accurate enough for a purchase decision without extra marketing noise.",
        section: "Title Style",
        sourceFile: "Beauty.pdf",
      },
      {
        label: "Image requirements",
        guidance:
          "Professional images on a white background are treated as a core listing requirement, not a cosmetic extra.",
        section: "Images",
        sourceFile: "Beauty.pdf",
      },
      {
        label: "Variation and search",
        guidance:
          "Beauty variants should group real size or color differences, while search visibility depends on correct style keywords and browse mapping.",
        section: "Variation Relationships; Browse & Search",
        sourceFile: "Beauty.pdf",
      },
    ],
  },
  clothing: {
    label: "Clothing & Accessories",
    sourceFile: "ClothingStyleGuide.pdf",
    evidence: [
      {
        label: "Title and classification",
        guidance:
          "Clothing titles need a disciplined format, and classification depends on browse plus special size type metadata.",
        section: "Title Style; Classification",
        sourceFile: "ClothingStyleGuide.pdf",
      },
      {
        label: "Variation setup",
        guidance:
          "Color, size, and family relationships should be configured as proper variations instead of separate unlinked listings.",
        section: "Variation Relationships",
        sourceFile: "ClothingStyleGuide.pdf",
      },
      {
        label: "Image compliance",
        guidance:
          "Main and child image requirements are category-specific, so apparel visual rules should be validated before launch.",
        section: "Images",
        sourceFile: "ClothingStyleGuide.pdf",
      },
    ],
  },
  electronics: {
    label: "Consumer Electronics",
    sourceFile: "CEStyleGuide.pdf",
    evidence: [
      {
        label: "No marketing fluff in titles",
        guidance:
          "Electronics titles should use title case and avoid filler claims like bonus, exclusive, stylish, or lightweight.",
        section: "Good Detail Page Content: Short Version",
        sourceFile: "CEStyleGuide.pdf",
      },
      {
        label: "Technical accuracy",
        guidance:
          "Technical details are a first-class content block, so specification accuracy matters as much as feature bullets.",
        section: "Technical Details",
        sourceFile: "CEStyleGuide.pdf",
      },
      {
        label: "Bundle and pack rules",
        guidance:
          "Bundles and multi-packs need explicit structure instead of improvised title wording or image-only explanation.",
        section: "Product Bundles; UPC and IPQ for multi-packs",
        sourceFile: "CEStyleGuide.pdf",
      },
    ],
  },
  grocery: {
    label: "Grocery & Gourmet Food",
    sourceFile: "GroceryStyleGuide.pdf",
    evidence: [
      {
        label: "Brand and manufacturer accuracy",
        guidance:
          "Brand and manufacturer fields are treated as discoverability-critical, which makes placeholder or inconsistent branding risky.",
        section: "Brand & Manufacturer",
        sourceFile: "GroceryStyleGuide.pdf",
      },
      {
        label: "Package quantity and flavor variants",
        guidance:
          "Item package quantity and valid flavor or size variations should be explicit rather than implied in free text.",
        section: "Item Package Quantity; Variation Relationships",
        sourceFile: "GroceryStyleGuide.pdf",
      },
      {
        label: "Browse keyword mapping",
        guidance:
          "Grocery search visibility depends on correct item-type keywords and browse placement, not just keyword stuffing.",
        section: "Browse and Search",
        sourceFile: "GroceryStyleGuide.pdf",
      },
    ],
  },
  health: {
    label: "Health & Personal Care",
    sourceFile: "HPCStyleGuide.pdf",
    evidence: [
      {
        label: "Claims need support",
        guidance:
          "Important information and product descriptions should stay aligned with substantiated claims, especially for health-adjacent offers.",
        section: "Important Information; Product Descriptions",
        sourceFile: "HPCStyleGuide.pdf",
      },
      {
        label: "Package quantity and variation",
        guidance:
          "Quantity and variation structure are part of the expected listing build, which matters for supplements and personal care packs.",
        section: "Item Package Quantity; Variation Relationships",
        sourceFile: "HPCStyleGuide.pdf",
      },
      {
        label: "Browse visibility",
        guidance:
          "Health listings are expected to use correct search terms and item-type keywords for discoverability.",
        section: "Browse & Search",
        sourceFile: "HPCStyleGuide.pdf",
      },
    ],
  },
  home: {
    label: "Home",
    sourceFile: "Home_SG_Q3-2020_-_Draft_Finalized_-_seller_facing_-_1218.pdf",
    evidence: [
      {
        label: "Main image on white",
        guidance:
          "Home listings require a clean primary image on a white background as the anchor asset.",
        section: "Ideal Image Set",
        sourceFile: "Home_SG_Q3-2020_-_Draft_Finalized_-_seller_facing_-_1218.pdf",
      },
      {
        label: "Complete image set",
        guidance:
          "The guide calls for supporting detail, scale, texture, and environmental images instead of relying on a single hero shot.",
        section: "Ideal Image Set - Detail Page Display",
        sourceFile: "Home_SG_Q3-2020_-_Draft_Finalized_-_seller_facing_-_1218.pdf",
      },
      {
        label: "Category-specific visuals",
        guidance:
          "Different home subcategories have different image expectations, so furniture and decor should not be reviewed with a one-size-fits-all image rule.",
        section: "Appendix 1 - Image Examples By Category",
        sourceFile: "Home_SG_Q3-2020_-_Draft_Finalized_-_seller_facing_-_1218.pdf",
      },
    ],
  },
  pets: {
    label: "Home, Garden & Pets",
    sourceFile: "Pets-Style_Guide.pdf",
    evidence: [
      {
        label: "Concise title format",
        guidance:
          "Pet product titles should be short, informative, and kept within the category title discipline instead of overstuffed phrasing.",
        section: "Product Titles (Item Names)",
        sourceFile: "Pets-Style_Guide.pdf",
      },
      {
        label: "Restricted-product sensitivity",
        guidance:
          "The guide explicitly separates listing restrictions and restricted products, so category review should account for policy exposure as well as listing quality.",
        section: "Listing Restrictions and Restricted Products",
        sourceFile: "Pets-Style_Guide.pdf",
      },
      {
        label: "Browse and variation",
        guidance:
          "Browse/search structure and variation relationships are both formal parts of compliant pet-category listing setup.",
        section: "Browse and Search; Variation Relationships",
        sourceFile: "Pets-Style_Guide.pdf",
      },
    ],
  },
  tools: {
    label: "Tools & Home Improvement",
    sourceFile: "ToolsAndHomeImprovement_StyleGuide.pdf",
    evidence: [
      {
        label: "Attribute completeness",
        guidance:
          "Product attributes are explicitly called out, so tool listings need structured specs instead of depending on prose alone.",
        section: "Product Attributes",
        sourceFile: "ToolsAndHomeImprovement_StyleGuide.pdf",
      },
      {
        label: "Package quantity and variation",
        guidance:
          "Multi-pack quantity and valid color or size relationships should be captured structurally before the offer goes live.",
        section: "Item Package Quantity; Variation Relationships",
        sourceFile: "ToolsAndHomeImprovement_StyleGuide.pdf",
      },
      {
        label: "Search placement",
        guidance:
          "Discoverability depends on accurate style keywords and browse placement, not just general hardware terminology.",
        section: "Browse & Search",
        sourceFile: "ToolsAndHomeImprovement_StyleGuide.pdf",
      },
    ],
  },
};

const categoryRuleProfiles: Record<string, AmazonCategoryRuleProfile> = {
  automotive: {
    titleMinChars: 55,
    titleMaxChars: 170,
    brandFirstExpected: true,
    recommendedImageCount: 6,
    minLifestyleImages: 1,
    minDetailImages: 3,
    minInfographicImages: 1,
    allowedVariationThemes: ["color", "size", "style", "pack"],
    browseSignalFloor: 68,
  },
  baby: {
    titleMinChars: 45,
    titleMaxChars: 150,
    brandFirstExpected: true,
    recommendedImageCount: 6,
    minLifestyleImages: 1,
    minDetailImages: 2,
    minInfographicImages: 1,
    allowedVariationThemes: ["color", "size", "style", "pack"],
    browseSignalFloor: 65,
  },
  beauty: {
    titleMinChars: 40,
    titleMaxChars: 150,
    brandFirstExpected: true,
    recommendedImageCount: 6,
    minLifestyleImages: 1,
    minDetailImages: 2,
    minInfographicImages: 1,
    allowedVariationThemes: ["color", "size", "scent", "style", "pack"],
    browseSignalFloor: 64,
  },
  clothing: {
    titleMinChars: 35,
    titleMaxChars: 125,
    brandFirstExpected: true,
    recommendedImageCount: 7,
    minLifestyleImages: 0,
    minDetailImages: 2,
    minInfographicImages: 0,
    allowedVariationThemes: ["color", "size", "style"],
    browseSignalFloor: 62,
  },
  electronics: {
    titleMinChars: 50,
    titleMaxChars: 150,
    brandFirstExpected: true,
    recommendedImageCount: 6,
    minLifestyleImages: 0,
    minDetailImages: 3,
    minInfographicImages: 1,
    allowedVariationThemes: ["color", "size", "style", "capacity", "pack"],
    browseSignalFloor: 70,
  },
  grocery: {
    titleMinChars: 35,
    titleMaxChars: 140,
    brandFirstExpected: true,
    recommendedImageCount: 5,
    minLifestyleImages: 0,
    minDetailImages: 2,
    minInfographicImages: 1,
    allowedVariationThemes: ["flavor", "size", "pack"],
    browseSignalFloor: 68,
  },
  health: {
    titleMinChars: 40,
    titleMaxChars: 150,
    brandFirstExpected: true,
    recommendedImageCount: 6,
    minLifestyleImages: 0,
    minDetailImages: 2,
    minInfographicImages: 1,
    allowedVariationThemes: ["size", "flavor", "pack", "style"],
    browseSignalFloor: 66,
  },
  home: {
    titleMinChars: 50,
    titleMaxChars: 180,
    brandFirstExpected: true,
    recommendedImageCount: 7,
    minLifestyleImages: 1,
    minDetailImages: 3,
    minInfographicImages: 1,
    allowedVariationThemes: ["color", "size", "style", "pack"],
    browseSignalFloor: 64,
  },
  pets: {
    titleMinChars: 35,
    titleMaxChars: 140,
    brandFirstExpected: true,
    recommendedImageCount: 6,
    minLifestyleImages: 1,
    minDetailImages: 2,
    minInfographicImages: 1,
    allowedVariationThemes: ["color", "size", "flavor", "style", "pack"],
    browseSignalFloor: 64,
  },
  tools: {
    titleMinChars: 50,
    titleMaxChars: 160,
    brandFirstExpected: true,
    recommendedImageCount: 6,
    minLifestyleImages: 0,
    minDetailImages: 3,
    minInfographicImages: 1,
    allowedVariationThemes: ["color", "size", "style", "pack"],
    browseSignalFloor: 68,
  },
};

const styleGuideKeyByBucket: Record<string, keyof typeof styleGuideProfiles> = {
  automotive: "automotive",
  baby: "baby",
  beauty: "beauty",
  electronics: "electronics",
  fashion: "clothing",
  grocery: "grocery",
  health: "health",
  home: "home",
  industrial: "tools",
  pet: "pets",
  tools: "tools",
};

function getBucket(categoryValue: string) {
  return categoryValue.split("__")[0];
}

export function getStyleGuideEvidence(categoryValue: string, limit = 3) {
  const key = styleGuideKeyByBucket[getBucket(categoryValue)];
  if (!key) {
    return [];
  }

  return styleGuideProfiles[key].evidence.slice(0, limit);
}

export function getCategoryRuleProfile(categoryValue: string) {
  const key = styleGuideKeyByBucket[getBucket(categoryValue)];
  if (!key) {
    return null;
  }

  return categoryRuleProfiles[key] ?? null;
}
