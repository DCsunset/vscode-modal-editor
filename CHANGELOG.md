# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.8.0](https://github.com/DCsunset/vscode-modal-editor/compare/v0.7.0...v0.8.0) (2022-04-26)


### Features

* add executeCommand and resetState commands ([899807b](https://github.com/DCsunset/vscode-modal-editor/commit/899807b04e5b3eadbf7d1a0d3f8f91467384a50d))
* add f, F, t, T motions to helix preset and update docs ([c53d1e2](https://github.com/DCsunset/vscode-modal-editor/commit/c53d1e21d996bc5b40a8f8cd44efd937a7bf6f28))
* add findText command ([1e334f2](https://github.com/DCsunset/vscode-modal-editor/commit/1e334f25a4f9601d617143fceed4785427a4779f))
* add multi-cursor for helix preset ([f6860ba](https://github.com/DCsunset/vscode-modal-editor/commit/f6860ba57ec9fecf41ceac118c6b5ce54a3b41a6))


### Bug Fixes

* merge with previous selection in findText ([7cbdcc7](https://github.com/DCsunset/vscode-modal-editor/commit/7cbdcc75fb80efb9bc12cf0bb61a7ff5c41ebcfe))

## [0.7.0](https://github.com/DCsunset/vscode-modal-editor/compare/v0.6.0...v0.7.0) (2022-04-24)


### Features

* add gotoLine and gotoLineSelect commands ([4957fc4](https://github.com/DCsunset/vscode-modal-editor/commit/4957fc4cb61c062fed628a64e3e68e5799720e29))
* improve goto mode ([9d39c97](https://github.com/DCsunset/vscode-modal-editor/commit/9d39c97dd243fac0c5222caf14bce3aaa091494f))

## [0.6.0](https://github.com/DCsunset/vscode-modal-editor/compare/v0.5.0...v0.6.0) (2022-04-22)


### Features

* add count parsing logic ([f09fcd1](https://github.com/DCsunset/vscode-modal-editor/commit/f09fcd1993576d3b6de7403f773abf5335ad18c4))
* add repeatable commands to helix preset and update README ([515f2b8](https://github.com/DCsunset/vscode-modal-editor/commit/515f2b80e2add24c25dcc935b1d4fe956c29db6c))
* support repeating command and add count to ctx ([67a8358](https://github.com/DCsunset/vscode-modal-editor/commit/67a8358d6c1920ccdf8a2ed56f5622162dcb9843))


### Bug Fixes

* fix count parsing ([0f3c957](https://github.com/DCsunset/vscode-modal-editor/commit/0f3c957a5b69f16f3548a4ac3422a9717e583824))

## [0.5.0](https://github.com/DCsunset/vscode-modal-editor/compare/v0.4.0...v0.5.0) (2022-04-20)


### Features

* add command mode ([d1764f0](https://github.com/DCsunset/vscode-modal-editor/commit/d1764f0f386fbf1fe6f0f360b29695d4a5259fd3))
* add command mode to helix preset ([b77c7c2](https://github.com/DCsunset/vscode-modal-editor/commit/b77c7c22330516ee62c8a2d1bb37436da9ec7ec1))
* allow modifying commands by backspace ([7b1da36](https://github.com/DCsunset/vscode-modal-editor/commit/7b1da36133ab92fe20da816b56ee508c47a9a433))


### Bug Fixes

* fix command mode in helix preset ([2c364a1](https://github.com/DCsunset/vscode-modal-editor/commit/2c364a117786ae20ef1085b91aace6f8bf8404e7))

## [0.4.0](https://github.com/DCsunset/vscode-modal-editor/compare/v0.3.1...v0.4.0) (2022-04-19)


### Features

* add replace command in helix.js ([c7d759f](https://github.com/DCsunset/vscode-modal-editor/commit/c7d759f9ef44ae803c95b23e833c95cd162aa7d3))
* add wildcard character and computed args ([9ded36d](https://github.com/DCsunset/vscode-modal-editor/commit/9ded36d3ae7ff3d7a8049f5a90e5781761fe7c39))


### Bug Fixes

* improve error handling ([90b7696](https://github.com/DCsunset/vscode-modal-editor/commit/90b769620cfa96cf318d1f04e04a27ada853bc9b))

### [0.3.1](https://github.com/DCsunset/vscode-modal-editor/compare/v0.3.0...v0.3.1) (2022-04-18)


### Features

* allow importing keybindings from preset directory ([cd69cb3](https://github.com/DCsunset/vscode-modal-editor/commit/cd69cb3c4b825359c010091db115317b94d61e54))


### Bug Fixes

* fix helix preset ([42b60e8](https://github.com/DCsunset/vscode-modal-editor/commit/42b60e86a2c235dcd656c0663502291070589ee4))

## [0.3.0](https://github.com/DCsunset/vscode-modal-editor/compare/v0.2.0...v0.3.0) (2022-04-16)


### Features

* allow configuring status bar priority ([14b1578](https://github.com/DCsunset/vscode-modal-editor/commit/14b1578f5cf9bb3a8ec2891883ca6c6abe2ee5db))
* read styles from settings ([d8c42b4](https://github.com/DCsunset/vscode-modal-editor/commit/d8c42b4e1f991414f51ddf51467249b897c0883e))
* show current key sequence in status bar ([9b8f466](https://github.com/DCsunset/vscode-modal-editor/commit/9b8f46629c20ed2608b21c541126ab9348e64ffd))


### Bug Fixes

* fix default config ([d700aad](https://github.com/DCsunset/vscode-modal-editor/commit/d700aad8462478c1e91f7a940dd8efe3be5abcf8))
* fix styles loading ([47c5852](https://github.com/DCsunset/vscode-modal-editor/commit/47c58520d57089132f4204372ac7fd3e5467b45b))
* improve error handling ([b3dd227](https://github.com/DCsunset/vscode-modal-editor/commit/b3dd227d8c3f361cf7455da497e50845de8ecbd8))
* use empty string as key for common keymap ([72e3d26](https://github.com/DCsunset/vscode-modal-editor/commit/72e3d26cb420fdbd742dd3134ec56a6f2d8f58b1))
