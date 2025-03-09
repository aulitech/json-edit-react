const catoDefaultData: Record<string, object> = {
    cato: {
      name: 'Cato',
      device_info: {
        HW_UID: '12345678',
        MODEL_UID: '87654321',
        GESTURE_SET: [
          'Idle',
          'Moving',
          'Nod Right',
          'Nod Left',
          'Nod Up',
          'Nod Down',
          'Tilt Right',
          'Tilt  Left',
        ],
        ACTION_SET: {
          'Noop': {},
          'keyboard': { action: ['tap', 'press', 'release'], keycode: 0, modifiers: 0},
          'mouse': { action: ['tap', 'double_tap', 'hold_until_idle', 'toggle'], button: 0},
          'Dwell Click': {},
          'Pointer Sleep': {},
          'Quick Sleep': {},
          'Reboot Cato': {},
          'Peer Increment': {},
          'Peer Erase': {},
        },
      },
      general: {
        sleep: {
          timeout: 60,
          threshold: 5,
        },
        orientation: {
          usb: 'down',
          led: 'left',
        },
      },
      actions: [
        {
          command: 'noop',
        },
        {
          command: 'button_action',
          args: [0, 'tap', 1],
        },
        {
          command: 'button_action',
          args: [0, 'tap', 2],
        },
        {
          command: 'button_action',
          args: [0, 'double_tap', 1],
        },
        {
          command: 'button_action',
          args: [0, 'toggle', 1],
        },
        {
          command: 'button_action',
          args: [0, 'hold_until_idle', 1],
        },
        {
          command: 'dwell_click',
        },
        {
          command: 'pointer_sleep',
        },
        {
          command: 'quick_sleep',
        },
        {
          command: 'reboot_cato',
        },
        {
          command: 'peer_increment',
        },
        {
          command: 'peer_erase',
        },
      ],
      gesture_model: [
        {
          ct: 0.5,
          rsi: 3,
        },
        {
          ct: 0.5,
          rsi: 3,
        },
        {
          ct: 0.5,
          rsi: 3,
        },
        {
          ct: 0.5,
          rsi: 3,
        },
        {
          ct: 0.5,
          rsi: 3,
        },
        {
          ct: 0.5,
          rsi: 3,
        },
        {
          ct: 0.5,
          rsi: 3,
        },
        {
          ct: 0.5,
          rsi: 3,
        },
      ],
      connections: [
        {
          enabled: true,
          name: 'computer',
          pointer: {
            enabled: true,
            sensitivity: 1,
            idle_threshold: 5,
            idle_duration: 80,
            dwell_repeat: true,
            min_run_cycles: 0,
            scale_x: 1,
            scale_y: 1,
            dynamic_mouse: {
              input: {
                slow: 15,
                fast: 60,
              },
              output: {
                slow: 0.4,
                fast: 2,
              },
            },
          },
          gesture: {
            enabled: false,
            bindings: [0, 0, 0, 0, 0, 0, 7, 10],
          },
          tapper: {
            enabled: false,
            max_tap_spacing: 0.5,
            tap_ths: 11,
            quiet: 2,
            shock: 2,
            bindings: [0, 1, 2, 4, 8],
          },
        },
        {
          enabled:  false,
          name: 'tablet',
          pointer: {
            enabled: true,
            sensitivity: 0.8,
            idle_threshold: 5,
            idle_duration: 80,
            dwell_repeat: false,
            min_run_cycles: 0,
            scale_x: 1,
            scale_y: 1,
            dynamic_mouse: {
              input: {
                slow: 15,
                fast: 60,
              },
              output: {
                slow: 0.4,
                fast: 2,
              },
            },
          },
          gesture: {
            enabled: false,
            bindings: [0, 0, 0, 0, 0, 0, 7, 10],
          },
          tapper: {
            enabled: false,
            max_tap_spacing: 0.5,
            tap_ths: 11,
            quiet: 2,
            shock: 2,
            bindings: [0, 1, 2, 4, 8],
          },
        },
        {
          enabled: false,
          name: 'phone',
          pointer: {
            enabled: true,
            sensitivity: 0.5,
            idle_threshold: 5,
            idle_duration: 80,
            dwell_repeat: true,
            min_run_cycles: 0,
            scale_x: 1,
            scale_y: 1,
            dynamic_mouse: {
              input: {
                slow: 15,
                fast: 60,
              },
              output: {
                slow: 0.4,
                fast: 2,
              },
            },
          },
          gesture: {
            enabled: false,
            bindings: [0, 0, 0, 0, 0, 0, 7, 10],
          },
          tapper: {
            enabled: false,
            max_tap_spacing: 0.5,
            tap_ths: 11,
            quiet: 2,
            shock: 2,
            bindings: [0, 1, 2, 4, 8],
          },
        },
      ],
    },
  }
  export default catoDefaultData;