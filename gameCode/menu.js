let menuState = {
	create: function() {
		// let nameLabel = game.add.text(90, 90, 'The Knight', {fill: '#fff'});
		// let startLabel = game.add.text(90, 190, 'press W to start',{fill: '#fff'});
		let menu = game.add.sprite(0, 0, 'menu')
		let spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		let level1Key = game.input.keyboard.addKey(Phaser.KeyCode.W);


		level1Key.onDown.addOnce(() => game.state.start('play', true, false, {level: 'level2', tiles: 'tiles2'}));
		spaceKey.onDown.addOnce(() => game.state.start('play', true, false, {level: 'level1', tiles: 'tiles'}));

	},


}
