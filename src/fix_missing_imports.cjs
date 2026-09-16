const fs = require("fs");
const path = require("path");

// Map of file -> missing imports to add
const fixes = {
  "components/Sidebar.tsx": {
    icons: ["IcoBriefcase", "IcoInbox", "IcoBook", "IcoChart"],
    types: ["Screen"],
  },
  "components/ThongTinDonSection.tsx": {
    icons: ["SparkleIcon"],
  },
  "components/TraCuuVaPhanTichSection.tsx": {
    icons: ["SparkleIcon"],
  },
  "components/QuyTrinhProgressCard.tsx": {
    types: ["Screen"],
  },
  "screens/NhanDonList.tsx": {
    icons: ["IcoSearch"],
    types: ["Screen"],
  },
  "screens/NhanDonThem.tsx": {
    icons: ["IcoFilePdf", "IcoArrowRight", "IcoInfo", "IcoScan"],
    types: ["Screen"],
  },
  "screens/BanPhanTich.tsx": {
    types: ["Screen"],
  },
  "screens/CongViecCuaToi.tsx": {
    types: ["Screen"],
  },
  "screens/DonTiepNhan.tsx": {
    types: ["Screen"],
  },
};

for (const [filePath, imports] of Object.entries(fixes)) {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, "utf-8");

  if (imports.icons && imports.icons.length > 0) {
    const iconsRelPath = filePath.startsWith("screens/") ? "../components/icons" : "./icons";
    const iconImport = `import { ${imports.icons.join(", ")} } from "${iconsRelPath}";\n`;
    // Add after last import line
    content = content.replace(/(import .*\n)(?!import)/, `$1${iconImport}`);
    // If that didn't work (single import), add after first import
    if (!content.includes(iconImport)) {
      content = content.replace(/(import .*;\n)/, `$1${iconImport}`);
    }
  }

  if (imports.types && imports.types.length > 0) {
    const typesRelPath = filePath.startsWith("screens/") ? "../types" : "../types";
    // Check if there's already a types import
    const typesImportRegex = /import \{([^}]+)\} from ["']\.\.\/types["'];/;
    const match = content.match(typesImportRegex);
    if (match) {
      // Merge with existing types import
      const existingTypes = match[1].split(",").map(t => t.trim());
      const allTypes = [...new Set([...existingTypes, ...imports.types])];
      content = content.replace(typesImportRegex, `import { ${allTypes.join(", ")} } from "${typesRelPath}";`);
    } else {
      const typeImport = `import { ${imports.types.join(", ")} } from "${typesRelPath}";\n`;
      content = content.replace(/(import .*\n)(?!import)/, `$1${typeImport}`);
      if (!content.includes(typeImport)) {
        content = content.replace(/(import .*;\n)/, `$1${typeImport}`);
      }
    }
  }

  fs.writeFileSync(fullPath, content, "utf-8");
  console.log(`Fixed: ${filePath}`);
}

console.log("All imports fixed!");
