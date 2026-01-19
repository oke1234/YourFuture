const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withPodfilePatches(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(config.modRequest.projectRoot, "ios", "Podfile");
      let podfile = fs.readFileSync(podfilePath, "utf8");

      const inject = `
  use_frameworks! :linkage => :dynamic
  use_modular_headers!
`;

      if (!podfile.includes("use_frameworks!")) {
        podfile = podfile.replace(
          /target 'GoalTracker' do/,
          match => `${match}\n${inject}`
        );
        fs.writeFileSync(podfilePath, podfile);
        console.log("✅ Podfile patched: inserted frameworks + modular headers inside target.");
      } else {
        console.log("ℹ️ Framework already enabled.");
      }

      return config;
    }
  ]);
};
