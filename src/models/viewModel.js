module.exports = function(){
	return {
		head : {
			title : 'Minesweeper by eCommera'
		},
		header : {
			title : 'eCommera Minesweeper',
			menuItems : {
				home : {
					label: 'Home',
					href: '/'
				},
				games : {
					label: 'Games',
					href: '/games'
				}
			}
		},
		footer : {
			copyright : '© eCommera Limited ' + new Date().getFullYear()
		}
	};
};