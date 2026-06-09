import { officialCategoryGroups } from "@/lib/amazon-category-tree";

export type SelectOption = {
  value: string;
  label: string;
  note?: string;
};

export type SelectOptionGroup = {
  label: string;
  sourceFile?: string;
  options: SelectOption[];
};

export const amazonMarketplaces: SelectOption[] = [
  { value: "US", label: "United States", note: "North America" },
  { value: "CA", label: "Canada", note: "North America" },
  { value: "MX", label: "Mexico", note: "North America" },
  { value: "BR", label: "Brazil", note: "South America" },
  { value: "UK", label: "United Kingdom", note: "Europe" },
  { value: "DE", label: "Germany", note: "Europe" },
  { value: "FR", label: "France", note: "Europe" },
  { value: "IT", label: "Italy", note: "Europe" },
  { value: "ES", label: "Spain", note: "Europe" },
  { value: "NL", label: "Netherlands", note: "Europe" },
  { value: "SE", label: "Sweden", note: "Europe" },
  { value: "PL", label: "Poland", note: "Europe" },
  { value: "TR", label: "Turkiye", note: "Europe" },
  { value: "AE", label: "United Arab Emirates", note: "Middle East" },
  { value: "SA", label: "Saudi Arabia", note: "Middle East" },
  { value: "EG", label: "Egypt", note: "Middle East" },
  { value: "IN", label: "India", note: "Asia Pacific" },
  { value: "JP", label: "Japan", note: "Asia Pacific" },
  { value: "SG", label: "Singapore", note: "Asia Pacific" },
  { value: "AU", label: "Australia", note: "Asia Pacific" },
];

export const originCountryOptions: SelectOption[] = [
  { value: "CN", label: "China" },
  { value: "VN", label: "Vietnam" },
  { value: "IN", label: "India" },
  { value: "MX", label: "Mexico" },
  { value: "TR", label: "Turkiye" },
  { value: "US", label: "United States" },
  { value: "DE", label: "Germany" },
];

function buildOfficialCategoryGroups(): SelectOptionGroup[] {
  return officialCategoryGroups.map((group) => ({
    label: group.label,
    sourceFile: group.sourceFile,
    options: group.options.map((option) => ({
      value: option.value,
      label: option.label,
    })),
  }));
}

export const calculatorCategoryOptionGroups = buildOfficialCategoryGroups();

export const tariffProductTypeOptionGroups: SelectOptionGroup[] = [
  {
    label: "Planning fallback",
    options: [{ value: "general", label: "General merchandise / uncategorized" }],
  },
  ...buildOfficialCategoryGroups(),
];

export const complianceCategoryOptionGroups = buildOfficialCategoryGroups();

export const complianceDocumentOptions: SelectOption[] = [
  { value: "Product specification sheet", label: "Product specification sheet" },
  { value: "Packaging artwork", label: "Packaging artwork and label proof" },
  { value: "Importer evidence", label: "Importer or manufacturer evidence" },
  { value: "Material disclosure", label: "Material disclosure" },
  { value: "Warning label review", label: "Warning label review" },
  { value: "Lab test report", label: "Lab test report" },
  { value: "Electrical safety test report", label: "Electrical safety test report" },
  { value: "Labeling and plug conformity", label: "Labeling and plug conformity" },
  { value: "Battery compliance evidence", label: "Battery compliance evidence" },
  { value: "Safety data sheet", label: "Safety data sheet or exemption sheet" },
  { value: "Ingredient list", label: "Ingredient list" },
  { value: "Safety data and claims substantiation", label: "Safety data and claims substantiation" },
  { value: "Packaging labeling proof", label: "Packaging labeling proof" },
  { value: "Claims substantiation", label: "Claims substantiation" },
  { value: "CPC or market-equivalent safety file", label: "CPC or market-equivalent safety file" },
  { value: "Age grading evidence", label: "Age grading evidence" },
  { value: "Declaration of conformity", label: "Declaration of conformity" },
  { value: "Responsible person details", label: "EU responsible person details" },
  { value: "Warning and safety images", label: "Warning and safety images" },
];

export const ungatingCategoryOptionGroups = buildOfficialCategoryGroups();

export const restrictedProductTopics: string[] = [
  "Alcohol",
  "Animals and animal-related products",
  "Automotive and powersports",
  "Cosmetics, skin, and hair care",
  "Dietary supplements",
  "Drugs and drug paraphernalia",
  "Electronics",
  "Explosives, weapons, and related items",
  "Food and beverages",
  "Hazardous and prohibited items",
  "Jewelry and precious gems",
  "Laser products",
  "Medical devices and accessories",
  "Pest control products and pesticides",
  "Plant and seed products",
  "Recalled products",
  "Surveillance equipment",
  "Tobacco and tobacco-related products",
];

export const hazmatSignals = [
  "Lithium battery or battery-powered vehicle",
  "Flammable liquid or aerosol",
  "Corrosive or chemical cleaner",
  "Pressurized gas container",
  "Magnetized material",
  "Toxic or oxidizing substance",
];

export const officialKnowledgeBaseByTool: Record<
  string,
  { articleId: string; title: string }[]
> = {
  "amazon-fba-calculator": [
    { articleId: "G200336920", title: "Selling on Amazon fee schedule" },
    { articleId: "GFD6HLGAEZC9VBGJ", title: "Fee category guidelines for your products" },
  ],
  "tariff-calculator-amazon": [
    { articleId: "G200280280", title: "Country of origin and importer responsibilities" },
    { articleId: "G200336920", title: "Selling on Amazon fee schedule" },
  ],
  "amazon-shipping-calculator": [
    { articleId: "G200140860", title: "FBA product restrictions" },
    { articleId: "G200280280", title: "Inbound shipping and country-of-origin obligations" },
  ],
  "amazon-product-compliance": [
    { articleId: "GUH6FA4XSJ2LZFLY", title: "Product safety and compliance" },
    { articleId: "G201003400", title: "Dangerous goods identification guide (hazmat)" },
    { articleId: "G200164330", title: "Restricted products" },
  ],
  "amazon-listing-title-checker": [
    { articleId: "STYLE-BEAUTY", title: "Official category style guides: title style sections" },
    { articleId: "STYLE-ELECTRONICS", title: "Official category style guides: title wording and technical accuracy" },
  ],
  "amazon-image-compliance-checker": [
    { articleId: "STYLE-HOME", title: "Official category style guides: ideal image set and white background" },
    { articleId: "STYLE-CLOTHING", title: "Official category style guides: apparel image requirements" },
  ],
  "amazon-variation-relationship-checker": [
    { articleId: "STYLE-BABY", title: "Official category style guides: variation relationships" },
    { articleId: "STYLE-PETS", title: "Official category style guides: browse and variation structure" },
  ],
  "amazon-browse-search-keyword-checker": [
    { articleId: "STYLE-GROCERY", title: "Official category style guides: browse and search guidance" },
    { articleId: "STYLE-TOOLS", title: "Official category style guides: search placement and attributes" },
  ],
  "amazon-product-bundling": [
    { articleId: "G87HAE6PMKKM23Z7", title: "Virtual product bundles" },
    { articleId: "G2BTQWUUDS3RV7WB", title: "Troubleshooting FAQ for virtual product bundles" },
    { articleId: "G200317520", title: "Product ID (GTIN) requirements by category" },
  ],
  "amazon-brand-registry": [
    { articleId: "G4LKBB2T7Q78CJRU", title: "Brand name approval requirements and issue resolution" },
    { articleId: "G200333160", title: "Categories and products that require approval" },
    { articleId: "G2N3GKE5SGSHWYRZ", title: "Amazon Brand Name policy" },
  ],
  "amazon-category-ungating": [
    { articleId: "G200333160", title: "Categories and products that require approval" },
    { articleId: "G200164330", title: "Restricted products" },
    { articleId: "GDQ9K277NYP6WNEW", title: "Invoice requirements for appealing a policy violation" },
  ],
  "amazon-a-plus-content": [
    { articleId: "G202102930", title: "A+ content" },
    { articleId: "GGW8U76SSNTRTBX7", title: "A+ content guidelines" },
    { articleId: "G202134820", title: "Create A+ content" },
  ],
  "amazon-enhanced-brand-content": [
    { articleId: "G202102930", title: "A+ content" },
    { articleId: "GLG4RQK2Y2RJADU4", title: "A+ Content guide" },
    { articleId: "G202102960", title: "A+ content FAQ & troubleshooting" },
  ],
  "amazon-storefront-design": [
    { articleId: "G202102930", title: "A+ content" },
    { articleId: "GS6TQLG64JYD4LSY", title: "Brand content display and optimization" },
    { articleId: "GVP453K5XRBJS7Y9", title: "Manage Your Experiments" },
  ],
  "amazon-fba-prep": [
    { articleId: "G201003400", title: "Dangerous goods identification guide (hazmat)" },
    { articleId: "G200140860", title: "FBA product restrictions" },
  ],
  "amazon-deal-finder": [
    { articleId: "G202043110", title: "Amazon deals" },
    { articleId: "GKN9A84DGTYWYHWY", title: "Troubleshoot suppressed and active deals" },
    { articleId: "G2ZCMMUXK7VP3K6S", title: "Stacked promotions" },
  ],
  "amazon-advertising-strategy": [
    { articleId: "G43381", title: "Programs and features to help increase sales" },
    { articleId: "GFG4VRQK7CQLGRTM", title: "Programs and tools for growth" },
    { articleId: "G200663330", title: "Get help with Amazon Ads" },
  ],
  "amazon-international-listings": [
    { articleId: "G201468480", title: "Listing Creation for Global Accounts" },
    { articleId: "G202140360", title: "How to price globally" },
    { articleId: "G201468380", title: "Taxes and regulations for Amazon Global Selling" },
  ],
  "amazon-inventory-management": [
    { articleId: "GTMXYZN64UJL7TT6", title: "FBA Inventory overview" },
    { articleId: "GZJF4DY2W6MERBAL", title: "IPI frequently asked questions" },
    { articleId: "G9BYNYF4FAXXBPJZ", title: "Minimum Inventory Level overview" },
  ],
  "amazon-search-optimization": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "G23501", title: "Use search terms effectively" },
    { articleId: "G8J4CB5ZBF3NX7TP", title: "Search Query Performance dashboard" },
  ],
  "amazon-competitor-monitoring": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "G8J4CB5ZBF3NX7TP", title: "Search Query Performance dashboard" },
    { articleId: "GSWQU4LQSP2JH75Z", title: "Search Catalog Performance Dashboard" },
  ],
  "amazon-keyword-tracker": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "G8J4CB5ZBF3NX7TP", title: "Search Query Performance dashboard" },
    { articleId: "GSWQU4LQSP2JH75Z", title: "Search Catalog Performance Dashboard" },
  ],
  "amazon-listing-optimization": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "GFJTFMCXPRQ5GHUK", title: "Unlock marketing opportunities" },
    { articleId: "G202102930", title: "A+ content" },
  ],
  "amazon-keyword-research": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "G23501", title: "Use search terms effectively" },
    { articleId: "G8J4CB5ZBF3NX7TP", title: "Search Query Performance dashboard" },
  ],
  "amazon-rank-tracker": [
    { articleId: "G8J4CB5ZBF3NX7TP", title: "Search Query Performance dashboard" },
    { articleId: "GSWQU4LQSP2JH75Z", title: "Search Catalog Performance Dashboard" },
    { articleId: "G10471", title: "Optimize your product discoverability" },
  ],
  "amazon-price-tracker": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "G8J4CB5ZBF3NX7TP", title: "Search Query Performance dashboard" },
    { articleId: "GSWQU4LQSP2JH75Z", title: "Search Catalog Performance Dashboard" },
  ],
  "amazon-competitor-analysis": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "GFJTFMCXPRQ5GHUK", title: "Unlock marketing opportunities" },
    { articleId: "G202102930", title: "A+ content" },
  ],
  "amazon-product-research": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "GFJTFMCXPRQ5GHUK", title: "Unlock marketing opportunities" },
    { articleId: "G200336920", title: "Selling on Amazon fee schedule" },
  ],
  "amazon-profit-analyzer": [
    { articleId: "G200336920", title: "Selling on Amazon fee schedule" },
    { articleId: "G202189370", title: "Coupons fees and charges" },
    { articleId: "G10471", title: "Optimize your product discoverability" },
  ],
  "amazon-trending-products": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "GFJTFMCXPRQ5GHUK", title: "Unlock marketing opportunities" },
    { articleId: "G200336920", title: "Selling on Amazon fee schedule" },
  ],
  "amazon-niche-finder": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "GFJTFMCXPRQ5GHUK", title: "Unlock marketing opportunities" },
    { articleId: "G200336920", title: "Selling on Amazon fee schedule" },
  ],
  "amazon-sales-estimator": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "G8J4CB5ZBF3NX7TP", title: "Search Query Performance dashboard" },
    { articleId: "GSWQU4LQSP2JH75Z", title: "Search Catalog Performance Dashboard" },
  ],
  "amazon-repricing-strategy": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "G200336920", title: "Selling on Amazon fee schedule" },
    { articleId: "GSWQU4LQSP2JH75Z", title: "Search Catalog Performance Dashboard" },
  ],
  "amazon-buy-box": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "GTMXYZN64UJL7TT6", title: "FBA Inventory overview" },
    { articleId: "G200336920", title: "Selling on Amazon fee schedule" },
  ],
  "amazon-ppc-campaign": [
    { articleId: "G43381", title: "Programs and features to help increase sales" },
    { articleId: "GFG4VRQK7CQLGRTM", title: "Programs and tools for growth" },
    { articleId: "G200663330", title: "Get help with Amazon Ads" },
  ],
  "amazon-negative-keywords": [
    { articleId: "G43381", title: "Programs and features to help increase sales" },
    { articleId: "GFG4VRQK7CQLGRTM", title: "Programs and tools for growth" },
    { articleId: "G200663330", title: "Get help with Amazon Ads" },
  ],
  "amazon-display-ads": [
    { articleId: "G43381", title: "Programs and features to help increase sales" },
    { articleId: "GFG4VRQK7CQLGRTM", title: "Programs and tools for growth" },
    { articleId: "G200663330", title: "Get help with Amazon Ads" },
  ],
  "amazon-dayparting-strategy": [
    { articleId: "G43381", title: "Programs and features to help increase sales" },
    { articleId: "GFG4VRQK7CQLGRTM", title: "Programs and tools for growth" },
    { articleId: "G200663330", title: "Get help with Amazon Ads" },
  ],
  "amazon-backend-keywords": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "G23501", title: "Use search terms effectively" },
    { articleId: "G8J4CB5ZBF3NX7TP", title: "Search Query Performance dashboard" },
  ],
  "amazon-listing-images": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "G202102930", title: "A+ content" },
    { articleId: "STYLE-HOME", title: "Official category style guides: ideal image set and white background" },
  ],
  "amazon-product-photography": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "G202102930", title: "A+ content" },
    { articleId: "STYLE-CLOTHING", title: "Official category style guides: apparel image requirements" },
  ],
  "amazon-review-analyzer": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "G202102930", title: "A+ content" },
    { articleId: "GYRKB5RU3FS5TURN", title: "Customer product reviews policies" },
  ],
  "amazon-seller-analytics": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "GFJTFMCXPRQ5GHUK", title: "Unlock marketing opportunities" },
    { articleId: "G202102930", title: "A+ content" },
  ],
  "amazon-brand-analytics": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "G8J4CB5ZBF3NX7TP", title: "Search Query Performance dashboard" },
    { articleId: "GSWQU4LQSP2JH75Z", title: "Search Catalog Performance Dashboard" },
  ],
  "amazon-seasonal-planning": [
    { articleId: "G202043110", title: "Amazon deals" },
    { articleId: "GTMXYZN64UJL7TT6", title: "FBA Inventory overview" },
    { articleId: "GFG4VRQK7CQLGRTM", title: "Programs and tools for growth" },
  ],
  "amazon-return-reduction": [
    { articleId: "G10471", title: "Optimize your product discoverability" },
    { articleId: "G202102930", title: "A+ content" },
    { articleId: "GYRKB5RU3FS5TURN", title: "Customer product reviews policies" },
  ],
  "amazon-variation-strategy": [
    { articleId: "STYLE-BABY", title: "Official category style guides: variation relationships" },
    { articleId: "STYLE-PETS", title: "Official category style guides: browse and variation structure" },
  ],
  "amazon-coupon-strategy": [
    { articleId: "GJHCPEFJ5JJQD52D", title: "Coupon eligibility criteria" },
    { articleId: "G202189350", title: "Create a coupon" },
    { articleId: "G202189370", title: "How do coupon budgets work?" },
  ],
  "amazon-brand-tailored-promotions": [
    { articleId: "GFM3F4GG5EYCC5XC", title: "Brand Tailored promotions" },
    { articleId: "G9TK2DS9YV88KKCD", title: "Create a Brand Tailored promotion" },
    { articleId: "G202189370", title: "How do coupon budgets work?" },
  ],
  "amazon-subscribe-save": [
    { articleId: "G201620110", title: "Subscribe & Save for sellers" },
    { articleId: "GM4FK8M23HTNPFSM", title: "Subscribe & Save dashboard" },
    { articleId: "GHZQ94CDDSEHAGLC", title: "Subscribe & Save performance report" },
  ],
  "amazon-suspension-appeal": [
    { articleId: "G201567350", title: "Create, implement, and submit an appeal for restricted product violations" },
    { articleId: "GDQ9K277NYP6WNEW", title: "Invoice requirements for appealing a policy violation" },
    { articleId: "GQ53DXVX2D2TPCPQ", title: "How to address an intellectual property policy violation" },
  ],
  "amazon-review-strategy": [
    { articleId: "GYRKB5RU3FS5TURN", title: "Customer product reviews policies" },
    { articleId: "GE8SYAZUBGVFBHCH", title: "Inappropriate product reviews" },
    { articleId: "G1801", title: "Selling policies and seller code of conduct" },
  ],
  "amazon-vine-program": [
    { articleId: "G92T8UV339NZ98TN", title: "Amazon Vine" },
    { articleId: "GMWK4XNWMHTTUQSD", title: "Amazon Vine Selling Partner eligibility" },
    { articleId: "GSTY2Q2TD5E84RXJ", title: "Enroll a product in Amazon Vine" },
  ],
  "amazon-global-selling": [
    { articleId: "G201062890", title: "Amazon Global Selling" },
    { articleId: "G201468480", title: "Listing Creation for Global Accounts" },
    { articleId: "G202140360", title: "How to price globally" },
  ],
  "amazon-private-label": [
    { articleId: "G2N3GKE5SGSHWYRZ", title: "Amazon Brand Name policy" },
    { articleId: "G200426310", title: "List products that do not have a product ID (UPC, EAN, JAN, or ISBN)" },
    { articleId: "G200317520", title: "Product ID (GTIN) requirements by category" },
  ],
  "amazon-wholesale-sourcing": [
    { articleId: "G8XTDLCH3MXMYLF2", title: "Error 18077" },
    { articleId: "GDQ9K277NYP6WNEW", title: "Invoice requirements for appealing a policy violation" },
    { articleId: "GQ53DXVX2D2TPCPQ", title: "How to address an intellectual property policy violation" },
  ],
};
