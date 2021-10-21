const Tambola = artifacts.require("Tambola");

const MultiCall2 = artifacts.require("MultiCall2");

module.exports = function (deployer) {
  deployer.deploy(Tambola);
  deployer.deploy(MultiCall2);
};
