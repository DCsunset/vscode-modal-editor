# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
