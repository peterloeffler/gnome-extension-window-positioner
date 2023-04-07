const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const WorkspaceManager = (global.screen || global.workspace_manager);
const Lang = imports.lang
const Meta = imports.gi.Meta
const Shell = imports.gi.Shell

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

// define the KeyManager
const KeyManager = new Lang.Class({
    Name: 'KeyManager',

    _init: function() {
        this.grabbers = new Map()

        global.display.connect(
            'accelerator-activated',
            Lang.bind(this, function(display, action, deviceId, timestamp){
                this._onAccelerator(action)
            })
        )
    },

    listenFor: function(accelerator, callback){
        let action = global.display.grab_accelerator(accelerator, 0)

        if(action == Meta.KeyBindingAction.NONE) {
            log(Me.metadata.uuid + ': Unable to bind key. Maybe already in use. Try to logout/login to Gnome.', accelerator)
        } else {
            let name = Meta.external_binding_name_for_action(action)

            Main.wm.allowKeybinding(name, Shell.ActionMode.ALL)

            this.grabbers.set(action, {
                name: name,
                accelerator: accelerator,
                callback: callback
            })
        }
    },

    _onAccelerator: function(action) {
        let grabber = this.grabbers.get(action)

        if(grabber) {
            this.grabbers.get(action).callback()
        }
    }
})

// define the config path and file the user of this extension can use for configuration
const configPath = (GLib.get_home_dir() + '/.config/' + Me.metadata.uuid).split('@')[0];
const configFile = Gio.file_new_for_path(configPath + '/config.json');

// create config directory if it doesn't exist
GLib.mkdir_with_parents(configPath, 0o777);

// create default config file if there is none
let configFileSrc = Gio.File.new_for_path(Me.dir.get_path() + '/config.json');
let configDirDst = Gio.File.new_for_path(configPath);
let configFileDst = configDirDst.get_child(configFileSrc.get_basename());
if (!configFileDst.query_exists(null)) {
    configFileSrc.copy(configFileDst, Gio.FileCopyFlags.OVERWRITE, null, null);
}

// monitor config file changes
let monitor = configFile.monitor_file(Gio.FileMonitorFlags.NONE, null);
monitor.connect('changed', () => {
    log(Me.metadata.uuid + ': Config File changed:', configFile.get_path());
    readConfigFile();
});

// reading config and calling KeyListener function to bind keyboard shortcuts 
function readConfigFile() {
    let [success, content] = configFile.load_contents(null);

    if (success) {
        let config = JSON.parse(imports.byteArray.toString(content));

        for (let windowName in config) {
            let window = config[windowName];

            let shortcut = window.shortcut;
            let x = window.x;
            let y = window.y;
            let width = window.width;
            let height = window.height;
            let maximize = window.maximize;
            KeyListen(shortcut, x, y, width, height, maximize);
        }
    } else {
            log(Me.metadata.uuid + ': Failed to read config file');
    }
}

// bind the keyboard shortcuts
function KeyListen(s, x, y, w, h, m = false) {
    let keyManager = new KeyManager()

    keyManager.listenFor(s, function(){
        let mw = WorkspaceManager.get_active_workspace().list_windows().find((window) => window.has_focus())

        if (mw.get_maximized()) {
            // 3 is META_MAXIMIZE_BOTH, so unmaximizing the window in both directions
            mw.unmaximize(3);
        }

        mw.move_resize_frame(0, x, y, w, h);

        if (m) {
            // Maximization mode, 1 -> horizontal, 2 -> vertical, 3 -> both
            // Maximization needs to be delayed a little, so that the window has time to move
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, function() { mw.maximize(m); });
        }
    })
}

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
    }

    enable() {
        log(Me.metadata.uuid + ': Enabling Gnome shell extension ' + Me.metadata.name);
        readConfigFile();
    }

    disable() {
        log(Me.metadata.uuid + ': Disabling Gnome shell extension ' + Me.metadata.name);
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
