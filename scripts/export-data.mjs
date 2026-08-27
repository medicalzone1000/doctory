import fs from "fs";
import vm from "vm";

const code = fs.readFileSync("js/data.js", "utf8");
const sandbox = { module: {}, exports: {} };
vm.createContext(sandbox);
vm.runInContext(code.replace(/^const /gm, "var "), sandbox);

if (!sandbox.DEMO_DOCTORS) {
  console.error("Failed to load data from js/data.js");
  process.exit(1);
}

fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(
  "data/governorates.json",
  JSON.stringify(
    {
      governorates: sandbox.EGYPT_GOVERNORATES,
      cityGovernorates: ["القاهرة", "الجيزة", "الإسكندرية"],
    },
    null,
    2
  )
);
fs.writeFileSync("data/specialties.json", JSON.stringify(sandbox.MEDICAL_SPECIALTIES, null, 2));
fs.writeFileSync("data/doctors.json", JSON.stringify(sandbox.DEMO_DOCTORS, null, 2));
console.log("Exported", sandbox.DEMO_DOCTORS.length, "doctors");
