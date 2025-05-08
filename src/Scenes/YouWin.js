class YouWin extends Phaser.Scene {
    constructor() {
        super("YouWin");

        // Initialize a class variable "my" which is an object.
        // The object has one property, "sprite" which is also an object.
        // This will be used to hold bindings (pointers) to created sprites.
        this.my = {sprite: {}};   
        
        // Create a flag to determine if the "bullet" is currently active and moving
        this.bulletActive = false;

        this.keyEnter =null;
    }
   

        create() {
            let menuConfig = {
                fontFamily: 'Courier',
                fontSize: '28px',
                backgroundColor: '#F3B141',
                color: '#843605',
                align: 'right',
                padding: {
                    top: 5,
                    bottom: 5,
                },
                fixedWidth: 0
            }
            this.starfield = this.add.tileSprite(0, 0, game.config.width, game.config.height, 'starfieldE').setOrigin(0, 0)
      
            this.add.text(game.config.width/2, game.config.height/2 - borderUISize - borderPadding, 'You Win', menuConfig).setOrigin(0.5);
            menuConfig.backgroundColor = '#00FF00';
            menuConfig.color = '#000';
            this.add.text(game.config.width/2, game.config.height/2 + borderUISize + borderPadding, 'Press Enter to Return', menuConfig).setOrigin(0.5);
            // Initialize key variables
            this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        }
      
        update() {
            if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
                this.scene.start('MainScreen');
            }
            
              

        }
    }