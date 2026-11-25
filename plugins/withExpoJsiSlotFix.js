const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Patches `expo-modules-jsi` for Xcode 26 / Swift 6.2 strict concurrency:
 * `nonisolated(unsafe) let slot = buffer.baseAddress!` triggers
 * "sending 'slot' risks causing data races" when captured inside `assumeIsolated`.
 * Wrapping it in `UncheckedSendable` (already defined in ExpoModulesJSI) avoids the error.
 */
module.exports = function withExpoJsiSlotFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const targetFile = path.join(
        config.modRequest.projectRoot,
        'node_modules',
        'expo-modules-jsi',
        'apple',
        'Sources',
        'ExpoModulesJSI',
        'Runtime',
        'Values',
        'JavaScriptObject.swift'
      );

      if (!fs.existsSync(targetFile)) {
        return config;
      }

      let content = fs.readFileSync(targetFile, 'utf-8');
      const targetBlock = [
        '    nonisolated(unsafe) let slot = buffer.baseAddress!',
        '    expo.emplaceUndefined(slot)',
        '    defer {',
        '      expo.destroyValues(slot, 1)',
        '    }',
        "    // The runtime can't be deallocated during a call on its JavaScript thread, so it's borrowed without",
        '    // a retain.',
        '    try runtime._withUnsafeGuaranteedRef { runtime in',
        '      try JavaScriptActor.assumeIsolated {',
        '        try encode(JavaScriptValue.Slot(slot), runtime)',
        '      }',
        '    }',
        '    body(slot.pointee)',
      ].join('\n');

      const replacementBlock = [
        '    let slot = UncheckedSendable(buffer.baseAddress!)',
        '    expo.emplaceUndefined(slot.value)',
        '    defer {',
        '      expo.destroyValues(slot.value, 1)',
        '    }',
        "    // The runtime can't be deallocated during a call on its JavaScript thread, so it's borrowed without",
        '    // a retain.',
        '    try runtime._withUnsafeGuaranteedRef { runtime in',
        '      try JavaScriptActor.assumeIsolated {',
        '        try encode(JavaScriptValue.Slot(slot.value), runtime)',
        '      }',
        '    }',
        '    body(slot.value.pointee)',
      ].join('\n');

      if (content.includes(targetBlock)) {
        content = content.replace(targetBlock, replacementBlock);
        fs.writeFileSync(targetFile, content, 'utf-8');
      }

      return config;
    },
  ]);
};
