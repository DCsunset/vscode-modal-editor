# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.11.0](https://github.com/DCsunset/vscode-modal-editor/compare/v1.10.0...v1.11.0) (2025-04-11)


### Features

* add option to disable number prefix parsing ([29cd1ec](https://github.com/DCsunset/vscode-modal-editor/commit/29cd1ecf5dac831edf7db542bfc9777a062833ac))

## [1.10.0](https://github.com/DCsunset/vscode-modal-editor/compare/v1.9.2...v1.10.0) (2024-08-10)


### ⚠ BREAKING CHANGES

* don't clear selections in setMode

### Features

* add option to prevent clearing selections on insert mode ([583bb8b](https://github.com/DCsunset/vscode-modal-editor/commit/583bb8bbd7bc07f6c7367d502d084ec8488f6637))


### Bug Fixes

* don't clear selections in setMode ([dee9bfc](https://github.com/DCsunset/vscode-modal-editor/commit/dee9bfc961b02dbc61778dde4ac2bc40bb1b9249))

## [1.9.2](https://github.com/DCsunset/vscode-modal-editor/compare/v1.9.1...v1.9.2) (2024-01-21)

## [1.9.1](https://github.com/DCsunset/vscode-modal-editor/compare/v1.9.0...v1.9.1) (2024-01-14)


### Bug Fixes

* update 'a' behavior in select mode ([04810a1](https://github.com/DCsunset/vscode-modal-editor/commit/04810a11605cab2d2b82f162785021cb496efb4d))
* update app state after loading keybindings ([1a6d3b1](https://github.com/DCsunset/vscode-modal-editor/commit/1a6d3b1f9851fc3c9f5079ebade8b6987d55684e))

## [1.9.0](https://github.com/DCsunset/vscode-modal-editor/compare/v1.8.1...v1.9.0) (2023-01-26)


### Features

* support autoload from preset directory and not saving keybindings in user settings ([cba6b7e](https://github.com/DCsunset/vscode-modal-editor/commit/cba6b7e17cf0e936434469469b30550e78e24e4f))

### [1.8.1](https://github.com/DCsunset/vscode-modal-editor/compare/v1.8.0...v1.8.1) (2022-12-05)


### Bug Fixes

* clear selections after deletion ([8795551](https://github.com/DCsunset/vscode-modal-editor/commit/87955516f0c17954ea76bb771d88b1ee07cff8f2))
* make paste command repeatable in helix preset ([6afba6d](https://github.com/DCsunset/vscode-modal-editor/commit/6afba6d70dc692c440c018ff6475a393a6d78987))

## [1.8.0](https://github.com/DCsunset/vscode-modal-editor/compare/v1.7.0...v1.8.0) (2022-11-11)


### Features

* add toUpperCase and use tranform for replacement ([e60853b](https://github.com/DCsunset/vscode-modal-editor/commit/e60853b18168d92865fda14a520fd8ced8f4bca2))
* add transform command ([363f018](https://github.com/DCsunset/vscode-modal-editor/commit/363f018f8a78ada4f978559071fc3f3f2eccd8f0))

## [1.7.0](https://github.com/DCsunset/vscode-modal-editor/compare/v1.6.0...v1.7.0) (2022-09-30)

## [1.6.0](https://github.com/DCsunset/vscode-modal-editor/compare/v1.5.2...v1.6.0) (2022-09-17)


### Features

* add clearSelections command ([4c5e3a9](https://github.com/DCsunset/vscode-modal-editor/commit/4c5e3a9e498c516987d1d3fa7755fd4a3237ebd5))
* use clearSelections in helix preset ([e646769](https://github.com/DCsunset/vscode-modal-editor/commit/e64676961231a93fb11bdb97d8196fa9dbb5f44e))


### Bug Fixes

* fix and optimize select mode for multiple cursors ([01d8c14](https://github.com/DCsunset/vscode-modal-editor/commit/01d8c142e54d1dfdef1b203300df4b05b22d694b))
* support multiple cursors in findText ([32bc97c](https://github.com/DCsunset/vscode-modal-editor/commit/32bc97cf4f99fe9e62e5bf72bb6cd54db9bbe8ac))

### [1.5.2](https://github.com/DCsunset/vscode-modal-editor/compare/v1.5.1...v1.5.2) (2022-08-28)


### Bug Fixes

* fix type for defaultMode ([73d4edf](https://github.com/DCsunset/vscode-modal-editor/commit/73d4edf673a76f64cbb4a283698b4662701ee1be))
* set default mode on update and startup ([fc6e189](https://github.com/DCsunset/vscode-modal-editor/commit/fc6e189a123d77e144333c032a54f19f27b84c05))
* support default mode in config ([51ed29d](https://github.com/DCsunset/vscode-modal-editor/commit/51ed29dd64d53bee2554fca8d7cae99d3943c352))

### [1.5.1](https://github.com/DCsunset/vscode-modal-editor/compare/v1.5.0...v1.5.1) (2022-07-27)


### Bug Fixes

* support loading from http URI ([c29dd47](https://github.com/DCsunset/vscode-modal-editor/commit/c29dd47ecee626e0b586c9f74fbc0af27802785e))

## [1.5.0](https://github.com/DCsunset/vscode-modal-editor/compare/v1.4.0...v1.5.0) (2022-07-26)


### Features

* support multi-cursor operations ([99c7ef0](https://github.com/DCsunset/vscode-modal-editor/commit/99c7ef06c4ca5eca9becc431cff7f3e7a375e177))


### Bug Fixes

* fix helix preset ([e3fc79d](https://github.com/DCsunset/vscode-modal-editor/commit/e3fc79d8ba7d7fadf9c2c8d43abc7aaadaef6519))
* remove auto generated files from git ([92c5853](https://github.com/DCsunset/vscode-modal-editor/commit/92c5853b74c8fbb53d44ca3cb073f81d752db37f))

## [1.4.0](https://github.com/DCsunset/vscode-modal-editor/compare/v1.3.0...v1.4.0) (2022-06-10)


### Features

* add record and replay ([354ccf4](https://github.com/DCsunset/vscode-modal-editor/commit/354ccf43ed52b6b2a0d80f65a1d9b82099fa3ac0))
* add record and replay keymaps in helix preset ([5623851](https://github.com/DCsunset/vscode-modal-editor/commit/5623851c912d9faaa8a31f4389c4e1848bb31006))
* support recording keys in insert mode ([ab47279](https://github.com/DCsunset/vscode-modal-editor/commit/ab4727909dff18df1b5a0f15ac66e0cace5707c6))

## [1.3.0](https://github.com/DCsunset/vscode-modal-editor/compare/v1.2.2...v1.3.0) (2022-06-03)


### Features

* add case tranformation in helix preset ([66e18cb](https://github.com/DCsunset/vscode-modal-editor/commit/66e18cb206aa213fab51128236fb0002b536a591))
* add text transformation commands ([0eabe69](https://github.com/DCsunset/vscode-modal-editor/commit/0eabe69e64299f51281273b57bda6741869a1875))

### [1.2.2](https://github.com/DCsunset/vscode-modal-editor/compare/v1.2.1...v1.2.2) (2022-05-27)


### Features

* add unimpaired keybindings for helix preset ([a2d7a75](https://github.com/DCsunset/vscode-modal-editor/commit/a2d7a7570c7be920e5fb7643ffe0f469f489c8dc))


### Bug Fixes

* fix escape keybindings ([8042fe8](https://github.com/DCsunset/vscode-modal-editor/commit/8042fe8430528097184924ac7ab97d6d7338aa1b))
* fix line expansion in helix preset ([d03c5dc](https://github.com/DCsunset/vscode-modal-editor/commit/d03c5dc5bff6a445bd61e557c41d4c81e208f446))
* fix search keybindings for helix preset ([341675d](https://github.com/DCsunset/vscode-modal-editor/commit/341675d30e8d57de2bde8b862386a6e595380603))

## [1.2.0](https://github.com/DCsunset/vscode-modal-editor/compare/v1.1.2...v1.2.0) (2022-05-14)


### ⚠ BREAKING CHANGES

* set count to undefined if no prefix

### Features

* add G motion and fix gotoLine command ([0b1d647](https://github.com/DCsunset/vscode-modal-editor/commit/0b1d647232c98d2b73cd197ddce6f133d34b6772))
* set count to undefined if no prefix ([b2202b8](https://github.com/DCsunset/vscode-modal-editor/commit/b2202b8a59d8c5418ccee5debb13486b6e892414))


### Bug Fixes

* remove gotoLineSelect command ([2da91c0](https://github.com/DCsunset/vscode-modal-editor/commit/2da91c04f1eeac05d9cb4297812a1ad1ce727738))

### [1.1.2](https://github.com/DCsunset/vscode-modal-editor/compare/v1.1.1...v1.1.2) (2022-05-12)


### Bug Fixes

* close widgets when pressing escape ([e39ca86](https://github.com/DCsunset/vscode-modal-editor/commit/e39ca8638777b78f0e62566d10dbacbc2d23d7ad))
* fix goto mode in helix preset ([a0f6360](https://github.com/DCsunset/vscode-modal-editor/commit/a0f6360c105ec8c6247ef26d263de21bab9b66c8))
* optimize helix preset ([e676c7f](https://github.com/DCsunset/vscode-modal-editor/commit/e676c7f657f4a61d997205839aa8ac98be97036a))

### [1.1.1](https://github.com/DCsunset/vscode-modal-editor/compare/v1.1.0...v1.1.1) (2022-05-11)


### Bug Fixes

* fix range in findText ([8d63ebe](https://github.com/DCsunset/vscode-modal-editor/commit/8d63ebe17afb5ba22ccc8478f02e2b9c88755477))

## [1.1.0](https://github.com/DCsunset/vscode-modal-editor/compare/v1.0.0...v1.1.0) (2022-05-11)


### Features

* add cut command ([a845532](https://github.com/DCsunset/vscode-modal-editor/commit/a845532b42401ba88a478bae15609f9fa0fca96f))
* add moveHalfPage command ([86e7bd3](https://github.com/DCsunset/vscode-modal-editor/commit/86e7bd3eb88626d2257d8b54569cb5e6c206cd99))


### Bug Fixes

* add command palette in helix preset ([eba3c75](https://github.com/DCsunset/vscode-modal-editor/commit/eba3c754eb9d7585940ee72b95351b6a12a5bcb5))
* fix cut motion in helix preset ([9968e85](https://github.com/DCsunset/vscode-modal-editor/commit/9968e85500b03a812324a868020321ababa87048))
* fix delete command in helix preset ([31f9ef2](https://github.com/DCsunset/vscode-modal-editor/commit/31f9ef222afacfe440bcb94658a881681a71e629))
* fix goto mode in helix preset ([6029ae4](https://github.com/DCsunset/vscode-modal-editor/commit/6029ae443c993cdb9d6855eb57eb8e362e577075))
* split moveHalfPage into two commands ([084b01c](https://github.com/DCsunset/vscode-modal-editor/commit/084b01c87a4b8d191494b9eda5d549784c62f1f4))

## [1.0.0](https://github.com/DCsunset/vscode-modal-editor/compare/v0.9.0...v1.0.0) (2022-05-05)


### ⚠ BREAKING CHANGES

* add inclusive range support

### Features

* add delete command and fix paste command ([aa3b8d2](https://github.com/DCsunset/vscode-modal-editor/commit/aa3b8d29c6cdf7e656d5273b0ffdf2fabbb6af88))
* add inclusive range support ([90e6a79](https://github.com/DCsunset/vscode-modal-editor/commit/90e6a798220b1abd555f483993e8ec1e9a202196))
* add line context ([77d7da2](https://github.com/DCsunset/vscode-modal-editor/commit/77d7da208ff15a37427fcc058bbcf77449bf1bfe))
* add more context variables and improve inclusive range ([9c5c6fd](https://github.com/DCsunset/vscode-modal-editor/commit/9c5c6fdd17249d4c37dd36f0d2cda0d8fccec45f))
* improve yanking and pasting in helix preset ([d186ac7](https://github.com/DCsunset/vscode-modal-editor/commit/d186ac7d3b2d64c4d85130db99b27df17d2d1124))
* support clipboard yanking and pasting ([c32d02b](https://github.com/DCsunset/vscode-modal-editor/commit/c32d02b9a7b9f84470c175c70c2efabe272c3249))
* update helix preset ([d3983ab](https://github.com/DCsunset/vscode-modal-editor/commit/d3983abff2b86993d377a0934384017efc18a723))


### Bug Fixes

* fix getSelection ([041d004](https://github.com/DCsunset/vscode-modal-editor/commit/041d0047683055b39164cdde54efbe6d26958c84))
* fix paste command ([3359d11](https://github.com/DCsunset/vscode-modal-editor/commit/3359d113ea43e24abb73a93169abbafebd51493c))
* fix selection change event handler ([1cc4aa0](https://github.com/DCsunset/vscode-modal-editor/commit/1cc4aa0867ba5479f6a6972aa494ed1dea49e1b0))

## [0.9.0](https://github.com/DCsunset/vscode-modal-editor/compare/v0.8.0...v0.9.0) (2022-04-27)


### Features

* add yank and paste command ([273bbb4](https://github.com/DCsunset/vscode-modal-editor/commit/273bbb499af0f36b8c42f51fde722c09ecd3d46a))
* add yank and paste motions to helix preset ([8a1e24b](https://github.com/DCsunset/vscode-modal-editor/commit/8a1e24b87bc5bc6114c425d733356bd6a9784f5d))


### Bug Fixes

* go to last line if count is larger than lineCount ([bbb26f4](https://github.com/DCsunset/vscode-modal-editor/commit/bbb26f4a4ce395334f653c467ce5dfd1d48e99f9))

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
