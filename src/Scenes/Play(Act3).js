class PlayAct3 extends Phaser.Scene {
    init() {
        // Reset variables when the scene starts
        this.registry.set('score', 0);
        this.registry.set('playerHealth', 3);
        
        // Reset bullet arrays when the scene reinitializes
        this.my.sprite.bullet = [];
        this.my.sprite.enemyBullet = [];
        
        // Reset immunity states
        this.batImmune = false;
        this.bat2Immune = false;
        
        // Reset game state
        this.gameEnded = false;
    }
    
    constructor() {
        super("PlayAct3");

        // Initialize a class variable "my" which is an object.
        // The object has two properties, both of which are objects
        //  - "sprite" holds bindings (pointers) to created sprites
        //  - "text"   holds bindings to created bitmap text objects
        this.my = {sprite: {}, text: {}};

        // Create a property inside "sprite" named "bullet".
        // The bullet property has a value which is an array.
        // This array will hold bindings (pointers) to bullet sprites
        this.my.sprite.bullet = [];
        this.my.sprite.enemyBullet = [];

        this.maxBullets = 4;           // Don't create more than this many bullets
        
        this.myScore = 0;       // record a score as a class variable
        // More typically want to use a global variable for score, since
        // it will be used across multiple scenes
        this.batImmune = false;
        this.bat2Immune = false;
    }
    
    preload() {
        this.load.image("fireball", "assets/NBall3.png"); // Replace with the correct path to your fireball texture
    }

    create() {
        this.batImmune = false;
        this.bat2Immune = false;
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
        
        // Create bat1 animation
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

        // Create bat2 animation 
        this.anims.create({
            key: "bat2_fly", 
            frames: [
                { key: "Obat1" },
                { key: "Obat2" },
                { key: "Obat3" },
            ], 
            frameRate: 7,
            repeat: -1
        });

        let my = this.my;
        const background = this.add.image(0, 0, 'background');
        background.setOrigin(0, 0);
        background.alpha = 0.1 ;
        background.displayWidth = this.sys.game.config.width;
        background.displayHeight = this.sys.game.config.height;
        my.sprite.explorer = this.add.sprite(game.config.width/2, game.config.height - 40 - 5, "explorer");
        my.sprite.explorer.setScale(0.2);

        my.sprite.bat = this.add.sprite(Phaser.Math.Between(50, game.config.width - 50), -50, "bat1").play("bat_fly");
        my.sprite.bat.setScale(0.50);
        my.sprite.bat.scorePoints = 50;

        my.sprite.bat2 = this.add.sprite(Phaser.Math.Between(50, game.config.width - 50), -50, "Obat1").play("bat2_fly");
        my.sprite.bat2.setScale(0.5);
        my.sprite.bat2.scorePoints = 100;

        this.startZigZagMovement(my.sprite.bat2);

        this.tween = this.tweens.add({
            targets: my.sprite.bat,
            y: game.config.height + my.sprite.bat.displayHeight,
            duration:1000,
            repeat: -1,
            onRepeat: () => {
                my.sprite.bat.x = Phaser.Math.Between(50, game.config.width - 50);
                my.sprite.bat.y = -my.sprite.bat.displayHeight;
            }
        });

        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.nextScene = this.input.keyboard.addKey("S");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Clear existing enemy bullets array first
        this.my.sprite.enemyBullet = [];
        
        // Create new enemy bullets
        for (let i = 0; i < 10; i++) {
            let bullet = new Bullet(this, 0, 0, "fireball");
            bullet.speed = 15;
            bullet.direction = 1; // down
            bullet.makeInactive(); // Make sure all bullets start inactive
            this.my.sprite.enemyBullet.push(bullet);
            this.add.existing(bullet);
        }
          
        this.time.addEvent({
            delay: 500,
            loop: true,
            callback: () => {
                this.enemySpit(this.my.sprite.bat);
                this.enemySpit(this.my.sprite.bat2);
            }
        });
        
        // Set movement speeds (in pixels/tick)
        this.playerSpeed = 7;
        this.bulletSpeed = 14;

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>How to Play</h2><br>A: left // D: right // Space: Throw Knives<br>';

        // Put score on screen
        my.text.score = this.add.bitmapText(580, 0, "rocketSquare", "Score " + this.myScore);

        my.text.wave = this.add.bitmapText(10, 5, "rocketSquare", "Final Wave", 30);

        this.gameEnded = false;
        this.survivalTimer = this.time.addEvent({
            delay: 600000,         // 1 minute timer
            callback: () => this.checkGameEnd("timer"),
            callbackScope: this
        });

        // Checks if bat can fire
        my.sprite.bat.canFire = true;  // Bat 1 can fire by default
        my.sprite.bat2.canFire = true; // Bat 2 can fire by default

        this.playerHealth = 6; // Player starts with 3 health

        // Display health on the screen
        my.text.health = this.add.bitmapText(10, 40, "rocketSquare", "Health: " + this.playerHealth, 30);
    }

    update() {
        let my = this.my;
        if (this.myScore >= 1000) {
            this.scene.stop("PlayAct3");
            this.scene.start("YouWin");
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

        // Check for collision with the bat1
        for (let bullet of my.sprite.bullet) {
            if (!this.batImmune && this.collides(bullet, my.sprite.bat)) {
                bullet.y = -100;
                this.myScore += my.sprite.bat.scorePoints;
                this.updateScore();
                this.batImmune = true; //makes bats immune to bullets for a short time
                my.sprite.bat.canFire = false; // Bat 1 cannot fire after being hit
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
                        this.batImmune = false; // Reset bat immunity
                        my.sprite.bat.canFire = true;
                        this.restartBatTween(); // calls a new bat tween function
                    }, this);
                });
            }
        }

        // Check for collision with the bat2
        for (let bullet of my.sprite.bullet) {
            if (!this.bat2Immune && this.collides(bullet, my.sprite.bat2)) {
                bullet.y = -100; // Remove bullet
                this.myScore += my.sprite.bat2.scorePoints; // Update score
                this.updateScore();
                this.bat2Immune = true; //makes bats immune to bullets for a short time
                my.sprite.bat2.canFire = false;

                // Stop the zig-zag movement
                this.tweens.killTweensOf(my.sprite.bat2);
                my.sprite.bat2.anims.stop();
                my.sprite.bat2.setTexture("Obat4").setScale(0.70);

                this.time.delayedCall(700, () => {
                    this.puff = this.add.sprite(my.sprite.bat2.x, my.sprite.bat2.y, "Obat4")
                        .setScale(0.25)
                        .play("puff");
                    my.sprite.bat2.visible = false;
                    this.sound.play("dadada", { volume: 0.5 });

                    this.puff.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                        // Reset bat2's position and restart zig-zag movement
                        my.sprite.bat2.x = Phaser.Math.Between(50, game.config.width - 50);
                        my.sprite.bat2.y = -50;
                        my.sprite.bat2.visible = true;
                        my.sprite.bat2.play("bat2_fly").setScale(0.50);
                        this.bat2Immune = false; // Reset bat2 immunity
                        my.sprite.bat2.canFire = true;
                        // Restart zig-zag movement
                        this.startZigZagMovement(my.sprite.bat2);
                    }, this);
                });
            }
        }
        
        // Check for collision with the enemy bullets
        for (let bullet of this.my.sprite.enemyBullet) {
            if (bullet.active) {
                bullet.y += bullet.speed * bullet.direction;
                if (bullet.y > this.game.config.height + bullet.displayHeight) {
                    bullet.makeInactive();
                }
                if (this.collides(bullet, this.my.sprite.explorer)) {
                    bullet.makeInactive(); // Deactivate the bullet
                    this.playerHealth--; // Decrease player's health
                    my.text.health.setText("Health: " + this.playerHealth); // Update health display
                    // Change the player's texture to "hurtExplorer"
                this.my.sprite.explorer.setTexture("Hurtexplorer");

                // Revert back to the default texture after 500ms
                this.time.delayedCall(1000, () => {
                this.my.sprite.explorer.setTexture("explorer");
            });

                    // Check if the player is out of health
                    if (this.playerHealth <= 0) {
                        this.scene.stop("PlayAct3");
                        this.scene.start("GameOver"); // Transition to Game Over scene
                    }
                }
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
            duration: 1000,
            repeat: -1,
            onRepeat: () => {
                this.my.sprite.bat.x = Phaser.Math.Between(25, game.config.width - 25);
                this.my.sprite.bat.y = -this.my.sprite.bat.displayHeight - 10;
            }
        });
    }
    
    startZigZagMovement(bat, steps = 0) {
        if (steps >= 5) {
            // Final tween to move off-screen
            this.tweens.add({
                targets: bat,
                y: game.config.height + bat.displayHeight,
                duration: 200,
                onComplete: () => {
                    // Reset position and restart zigzag
                    bat.x = Phaser.Math.Between(50, game.config.width - 50);
                    bat.y = -50;
                    this.startZigZagMovement(bat);
                }
            });
            return;
        }
    
        // One zig-zag movement
        this.tweens.add({
            targets: bat,
            x: Phaser.Math.Between(50, game.config.width - 50),
            y: bat.y + 100,
            duration: 500,
            ease: 'Power1',
            onComplete: () => {
                this.startZigZagMovement(bat, steps + 1);  // go to next zig-zag
            }
        });
    }

    enemySpit(bat) {
        if (!bat.canFire) return; // If the bat cannot fire, exit the method
    
        for (let bullet of this.my.sprite.enemyBullet) {
            if (!bullet.active) {
                bullet.x = bat.x;
                bullet.y = bat.y + bat.displayHeight / 2;
                bullet.direction = 1;
                bullet.makeActive();
                break;
            }
        }
    }
    
    checkGameEnd(trigger) {
        if (this.gameEnded) return;  // prevent multiple calls
        this.gameEnded = true;
        this.scene.stop("PlayAct3");
        this.scene.start("GameOver"); // Transition to Game Over scene
    }
    
    // Add this cleanup method to ensure proper reset of resources
    shutdown() {
        // Clear bullet arrays
        this.my.sprite.bullet = [];
        this.my.sprite.enemyBullet = [];
        
        // Kill all tweens
        this.tweens.killAll();
        
        // Stop all animations
        this.anims.pauseAll();
    }
}