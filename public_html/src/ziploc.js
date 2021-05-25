/*! Copyright 2021 Timo Tijhof <https://timotijhof.net> | MIT License */
function main() {
	const canon = document.querySelector('link[rel="canonical"]').href;
	const alertEl = document.getElementById('ziplock-alert');

	if (!canon.includes(location.pathname)) {
		alertEl.innerHTML = '<strong>Thanks for playing!</strong> <a href="./credits.html">Back to credits</a>.';
		alertEl.classList.add('alert--success');

		const faviconLink = document.querySelector('link[rel="icon"]');
		faviconLink.type = 'image/svg+xml';
		faviconLink.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22>' +
				'<text y=%22.9em%22 font-size=%2290%22>🐣</text></svg>';
		document.title = 'Yay! ziploc';
	}

	if (history.replaceState) {
		history.replaceState(history.state, document.title, canon + location.hash);
	}
}

main();
