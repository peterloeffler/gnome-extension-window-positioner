# GNOME Shell extension - Window Positioner

Gnome Shell extension to configure keyboard shortcuts to set the size and position of your currently active window.  
Configuration is done in a JSON file.

## Features

* Easy configruation via JSON file
* Define x and y for position, width and height for size

## Example Configuration

You can find the configuration file in ~/.confg/window-positioner/config.json

```
{
  "shortcut01": {
    "shortcut": "<ctrl><alt>1",
    "x": "0",
    "y": "0",
    "width": "1920",
    "height": "1080",
    "maximize": false // don't maximize your window
  },
  "shortcut02": {
    "shortcut": "<ctrl><alt>2",
    "x": "1000",
    "y": "0",
    "width": "1920",
    "height": "1080",
    "maximize": 1 // maximize your window horizontally
  },
  "shortcut03": {
    "shortcut": "<ctrl><alt>3",
    "x": "100",
    "y": "10",
    "width": "1920",
    "height": "1080",
    "maximize": 2 // maximize your window vertically
  },
  "shortcut04": {
    "shortcut": "<ctrl><alt>4",
    "x": "0",
    "y": "0",
    "width": "10",
    "height": "10",
    "maximize": 3 // maximize your window horizontally and vertically
  }
}
```
