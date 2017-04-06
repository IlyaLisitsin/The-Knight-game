window.onload = function() {


    var game = new Phaser.Game(1025, 480, Phaser.CANVAS, 'gameAround', { preload: preload, create: create, update: update });

    function preload() {
        game.load.tilemap('level1', 'assets/levels/level1.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/levels/tiles.png');
        game.load.image('star', 'assets/star.png');
        game.load.image('blob', 'assets/ball.png');
        game.load.image('dungeon', 'assets/dungeon.png');
        game.load.atlasJSONArray('dude', 'assets/knight.png', 'assets/knight.json');
        game.load.atlasJSONArray('zombie', 'assets/zombie.png', 'assets/zombie.json');

    }

    let map;
    //let objArr;
    let tileset;
    let layer;
    let cursors;
    let scoreText;
    let background;

    //let platforms;

    let player;
    let blobs;
    let stars;

    let score = 0;
    let jumpTimer = 0;

    // Blob
    let blob;
    let blobX = 120;
    let waveSize = 8;
    let wavePixelChunk = 2;
    let bitMapData;
    let waveDataCounter;

    let zombies;
    let zombie;
    let zomVel = -120;

    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        background = game.add.tileSprite(0, 0, 1920, 480, 'dungeon');
        background.fixedToCamera = true;

        map = game.add.tilemap('level1');
        map.addTilesetImage('tiles');
        layer = map.createLayer('Tile Layer 1');
        game.add.existing(layer);
        layer.resizeWorld();
        map.setCollisionByExclusion([ 13, 14, 15, 16, 46, 47, 48, 49, 50, 51 ]);

        bitMapData = game.add.bitmapData(32, 64);
        waveData = game.math.sinCosGenerator(32, 8, 8, 2);

        player = game.add.sprite(32, game.world.height - 190, 'dude');
        game.physics.arcade.enable(player);
        game.camera.follow(player);

        player.body.gravity.y = 1100;
        player.body.collideWorldBounds = true;

        player.animations.add('left', [0, 1, 2, 3], 3, true);
        player.animations.add('right', [0, 1, 2, 3], 3, true);
        player.animations.add('kick', [4, 5, 6, 7], 5, true);

        stars = game.add.group();
        stars.enableBody = true;

        blobs = game.add.group();
        blobs.enableBody = true;

        zombies = game.add.group();
        zombies.enableBody = true;

        enetetiesPositioning();

        scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#fff' });
        scoreText.fixedToCamera = true;
        cursors = game.input.keyboard.createCursorKeys();
    }

    function update() {


        game.physics.arcade.collide(stars, layer);
        game.physics.arcade.collide(blobs, layer);
        game.physics.arcade.collide(zombies, layer);
        game.physics.arcade.collide(player, layer);

        game.physics.arcade.overlap(stars, player, collectStar, null, this);
        game.physics.arcade.overlap(blobs, player, blobKills, null, this);

        player.body.velocity.x = 0;

        // Movements of Player
        if (cursors.left.isDown && player.body.onFloor())
        {
            player.body.velocity.x = -150;
            player.animations.play('left');
            player.scale.x = -1;
        }
        else if (cursors.left.isDown && !player.body.onFloor())
        {
            player.body.velocity.x = -150;
            player.animations.stop();
            player.frame = 2;
            player.scale.x = -1;
        }
        else if (cursors.right.isDown && player.body.onFloor())
        {
            player.body.velocity.x = 150;
            player.animations.play('right');
            player.scale.x = 1;
        }
        else if (cursors.right.isDown && !player.body.onFloor())
        {
            player.body.velocity.x = 150;
            player.animations.stop();
            player.frame = 2;
            player.scale.x = 1;
        }
        else if (cursors.down.isDown)
        {
            player.animations.play('kick');
        }

        //  Allow the players to jump if they are touching the ground.
        else if (cursors.up.isDown && player.body.onFloor() && game.time.now > jumpTimer)
        {
            player.body.velocity.y = -500;
            jumpTimer = game.time.now + 900;
        }
        else
        {
            //  Stand idle
            player.animations.stop();
            player.frame = 1;
        }


        // Enemy begins to follow the player if he's too close

        // let diff = player.body.x - blob.body.x;
        // if (player.body.y -blob.body.y < -135)
        // {
        //     blob.body.velocity.x = 0;
        // } else if (diff >= 150 || diff <= -150) 
        // {
        //     blob.body.velocity.x = 0;
        // } else if (diff < 0)
        // {
        //      blob.body.velocity.x = -120;
        // } else if (diff > 0)
        // {
        //    blob.body.velocity.x = 120; 
        // }


        // Patroling for blobs
        for(key in blobs.children)
        {
            if (!blobs.children[key].body.velocity.x)
            {
                blobX *= -1;
                blobs.children[key].body.velocity.x = blobX;
            }
        }
        for(key in zombies.children)
        {
            if (!zombies.children[key].body.velocity.x)
            {
                zomVel *= -1;
                zombies.children[key].body.velocity.x = zomVel;
            }
        }

        bitMapData.cls();
        updateNastyBlob();
        UpdateZombie();
    }

    function collectStar (player, star) {
        // Removes the star from the screen
        star.kill();
        //  Add and update the score
        score += 10;
        scoreText.text = 'Score: ' + score;
    }

    function blobKills(player, blob) {
        if (cursors.down.isDown) {
            blob.kill();
        }
        else {
            player.kill();
            player.reset(52, 52)
        }
    }

    function updateNastyBlob() {
        let s = 0;
        let copyRect = { x: 0, y: 0, w: wavePixelChunk, h: 35 };
        let copyPoint = { x: 0, y: 0 };

        for (let x = 0; x < 32; x += wavePixelChunk)
        {
            copyPoint.x = x;
            copyPoint.y = waveSize + (waveSize / 2) + waveData.sin[s];

            bitMapData.context.drawImage(game.cache.getImage('blob'), copyRect.x, copyRect.y, copyRect.w, copyRect.h, copyPoint.x, copyPoint.y, copyRect.w, copyRect.h);

            copyRect.x += wavePixelChunk;

            s++;
    }
        // Cycle through the wave data - this is what causes the image to "undulate"
        Phaser.ArrayUtils.rotate(waveData.sin);
        waveDataCounter++;

        if (waveDataCounter === waveData.length)
        {
            waveDataCounter = 0;
        }
    }

    function UpdateZombie () {
        if(zombie.body.velocity.x < 0) {
            zombie.animations.play('move');
            zombie.scale.x = 1;
        }
        else {
            zombie.scale.x = -1;
            zombie.animations.play('move');
        }

    }

    function enetetiesPositioning() {

        let objArr = map["objects"]["Object Layer 1"];

        for (let i = 0; i < objArr.length; i++)
        {
            let Entity = objArr[i];
            if (Entity["name"] === "blob")
            {
                blob = blobs.create(Entity["x"], Entity["y"], bitMapData);
                blob.body.gravity.y = 1100;
                blob.body.collideWorldBounds = true;
                blob.body.velocity.x = blobX;

            } else if (Entity["name"] === "star") {
                let star = stars.create(Entity["x"], Entity["y"], "star");
                star.body.gravity.y = 300;
                star.body.bounce.y = 0.7 + Math.random() * 0.2;
                star.body.collideWorldBounds = true;
            } else if (Entity["name"] === "zombie") {
                zombie = zombies.create(Entity["x"], Entity["y"], "zombie")
                zombie.body.collideWorldBounds = true;
                zombie.body.gravity.y = 1100;
                zombie.animations.add('move', [0, 1, 2, 3], 3, true);
                zombie.body.velocity.x = zomVel;
            }
        }
    }
}
