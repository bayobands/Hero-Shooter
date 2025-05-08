class Play extends Phaser.Scene {
    init() {
        // Reset variables when the scene starts
        this.registry.set('score', 0);
        this.registry.set('playerHealth', 3);
    }
    constructor() {
        super("Play");

        this.my = {sprite: {}, text: {}};


        this.my.sprite.bullet = [];   
        this.maxBullets = 1;           // Don't create more than this many bullets
        
        this.myScore = 0;       // record a score as a class variable
        // More typically want to use a global variable for score, since
        // it will be used across multiple scenes
        this.batImmune = false;
    }


    create() {
        this.batImmune = false;
         // Access reset variables
         this.myScore = this.registry.get('score');
         this.playerHealth = this.registry.get('playerHealth');
 
         // Initialize UI
        // Create white puff animation
        this.anims.create({
            key: "puff",
            frames: [
                { key: "whitePuff00" },
                { key: "whitePuff01" },
                { key: "whitePuff02" },
                { key: "whitePuff03" },
            ],
            frameRate: 20,    // Note: case sensitive (thank you Ivy!)
            repeat: 5,
            hideOnComplete: true
        });
        // Create bat animation
        this.anims.create({
            key: "bat_fly", 
            frames: [
                { key: "bat1" },
                { key: "bat2" },
                { key: "bat3" },
            ],
            frameRate: 7,
            repeat: -1
            });

        let my = this.my;
        const background = this.add.image(0, 0, 'background');
        background.setOrigin(0, 0);
        background.displayWidth = this.sys.game.config.width;
        background.displayHeight = this.sys.game.config.height;
        my.sprite.explorer = this.add.sprite(game.config.width/2, game.config.height - 40 - 5, "explorer");
        my.sprite.explorer.setScale(0.2);

        my.sprite.bat = this.add.sprite(game.config.width/2, 80, "bat1").play("bat_fly");
        my.sprite.bat.setScale(0.50);
        my.sprite.bat.scorePoints = 50; // Set the score points for the bat

        this.tween = this.tweens.add({
            targets: my.sprite.bat,
            y: game.config.height + my.sprite.bat.displayHeight,
            duration:3000,
            repeat: -1,
            onRepeat: () => {
                my.sprite.bat.x = Phaser.Math.Between(50, game.config.width - 50);
                my.sprite.bat.y = -my.sprite.bat.displayHeight;
            }
        });


        
            

        

        // Notice that in this approach, we don't create any bullet sprites in create(),
        // and instead wait until we need them, based on the number of space bar presses

        




        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.nextScene = this.input.keyboard.addKey("S");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Set movement speeds (in pixels/tick)
        this.playerSpeed = 5;
        this.bulletSpeed = 11;

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>How to Play</h2><br>A: left // D: right // Space: Throw Knives<br>Score 300 points to win!<br>';

        // Put score on screen
        my.text.score = this.add.bitmapText(580, 0, "rocketSquare", "Score " + this.myScore);

        // Put title on screen
        my.text.wave = this.add.bitmapText(10, 5, "rocketSquare", "Wave 1", 30);

        this.gameEnded = false;
        this.survivalTimer = this.time.addEvent({
            delay: 60000,         // 45 seconds
            callback: () => this.checkGameEnd("timer"),
            callbackScope: this
        });
        this.playerHealth = 6; // Player starts with 3 health

        // Display health on the screen
        my.text.health = this.add.bitmapText(10, 40, "rocketSquare", "Health: " + this.playerHealth, 30);
        


    }

    update() {
        let my = this.my;

        // Check for game over condition
        if (this.myScore >= 300) {
            this.checkGameEnd("score");
        }
        

        // Moving left
        if (this.left.isDown) {
            // Change to turning sprite for left movement
            my.sprite.explorer.setTexture("explorer_turning_left");
            
            // Check to make sure the sprite can actually move left
            if (my.sprite.explorer.x > (my.sprite.explorer.displayWidth / 2)) {
                my.sprite.explorer.x -= this.playerSpeed;
            }
        }

        // Moving right
        else if (this.right.isDown) {
            // Change to turning sprite for right movement
            my.sprite.explorer.setTexture("explorer_turning_right");
            
            // Check to make sure the sprite can actually move right
            if (my.sprite.explorer.x < (game.config.width - (my.sprite.explorer.displayWidth / 2))) {
                my.sprite.explorer.x += this.playerSpeed;
            }
        } else {
            // Revert to the default sprite when no key is pressed
            my.sprite.explorer.setTexture("explorer");
        }

        // Check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            // Are we under our bullet quota?
            if (my.sprite.bullet.length < this.maxBullets) {
                my.sprite.bullet.push(this.add.sprite(
                    my.sprite.explorer.x, my.sprite.explorer.y - (my.sprite.explorer.displayHeight / 2), "heart")
                );
            }
        }

        // Remove all of the bullets which are offscreen
        my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight / 2));

        // Check for collision with the bat
        for (let bullet of my.sprite.bullet) {
            if (!this.batImmune && this.collides(bullet, my.sprite.bat)) {
                bullet.y = -100;
                this.myScore += my.sprite.bat.scorePoints;
                this.updateScore();
                this.batImmune = true;
                this.tween.stop();
                my.sprite.bat.anims.stop();
                my.sprite.bat.setTexture("bat4").setScale(0.70);

                this.time.delayedCall(700, () => { 
                    this.puff = this.add.sprite(my.sprite.bat.x, my.sprite.bat.y, "bat4")
                        .setScale(0.25)
                        .play("puff");
                my.sprite.bat.visible = false;
                this.sound.play("dadada", { volume: .5 });
                this.puff.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    my.sprite.bat.x = Phaser.Math.Between(50, game.config.width - 50);
                    my.sprite.bat.y = -my.sprite.bat.displayHeight;
                    this.my.sprite.bat.visible = true;
                    my.sprite.bat.play("bat_fly").setScale(0.50);
                    this.batImmune = false;
                    this.restartBatTween();
                }, this);
            });

        }
    }
        // Make all of the bullets move
        for (let bullet of my.sprite.bullet) {
            bullet.y -= this.bulletSpeed;
        }
    }
    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.myScore);
    }

    restartBatTween() {
        this.tween = this.tweens.add({
            targets: this.my.sprite.bat,
            y: game.config.height + this.my.sprite.bat.displayHeight,
            duration: 3000,
            repeat: -1,
            onRepeat: () => {
                this.my.sprite.bat.x = Phaser.Math.Between(25, game.config.width - 25);
                this.my.sprite.bat.y = -this.my.sprite.bat.displayHeight - 10;
            }
        });
    }

    checkGameEnd(trigger) {
        if (this.gameEnded) return;  // prevent multiple calls
        this.gameEnded = true;
        this.scene.stop("PlayAct");

        this.scene.start("LevelComplete");
    }
    
    
}
