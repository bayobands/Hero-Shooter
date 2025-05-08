// Bayo Bandele
// Created: 5/1/2025
// Phaser: 3.70.0
//
// Deep Cave
//
// Multiple examples of how to implement bullet firing logic using Phaser
// 
// Art assets from Kenny Assets:
// https://kenney.nl/assets/

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    fps: { forceSetTimeOut: true, target: 60 },   // ensure consistent timing across machines
    width: 800,
    height: 600,
    scene: [MainScreen, Play, LevelComplete, PlayAct2, LevelComplete2, PlayAct3, YouWin, GameOver, Credits],
}

let game = new Phaser.Game(config);
let borderUISize = game.config.height / 15
let borderPadding = borderUISize / 3
