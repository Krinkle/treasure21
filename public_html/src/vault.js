/*! Copyright 2021 Timo Tijhof <https://timotijhof.net> | MIT License */
function main() {
	const titleGradient = document.getElementById('title-gradient');
	const titleSpotlight = document.getElementById('title-spotlight');
	const TEXT_NBSP = '\u00a0';

	const board = document.getElementById('vault-board');
	// The board is this many steps wide/tall.
	const BOARD_STEPS = 20;
	// Each step is measured as a percentage (e.g. 5% each).
	const BOARD_GAP = Math.floor(100 / BOARD_STEPS);
	// Permit some walking around outside the board, why not right?
	const BOARD_BLEED = 6;

	const dino = document.getElementById('vault-dino');
	let dinoPos = { x: 9, y: 9 };
	let dinoLock = false;
	let dinoHolding = false;
	const FACE_LEFT = 'left';
	const FACE_RIGHT = 'right';

	const modal = document.getElementById('vault-modal-0');
	const modalConfirm = document.getElementById('vault-modal-1');

	const TREASURE_UNSOLVED = 0;
	const TREASURE_SOLVED = 1;
	const TREASURE_CLAIMED = 2;

	const volumeInput = document.getElementById('vault-kb-volume');
	const volumeInputWrap = document.getElementById('vault-kb-volume-wrap');
	// Consider current value from the page even initially, because
	// browsers generally remember changes to it, automatically, between refreshes.
	// That is useful! (And besides, if it didn't read this value, we'd have to do
	// something else to reset the UI, as otherwise the UI and our state would mismatch).
	const VOLUME_DEFAULT = volumeInput.value || 0.3;
	const audioMain = new Audio('./lib/0ad_08bitbonus_48kbs.mp3');
	const audioState = {
		startedMain: false
	};

	const cave = document.getElementById('vault-cave');
	const caveState = {
		slots: [null, null, null, null],
		zone: null,
		queue: Promise.resolve()
	};
	const finalEncrypted = '8110ce7cb6d2dc2339596366t0Gh58xiJZzKsR6aNkOgOjwNA24HFw/E';

	const INPUT_UP = 'UP';
	const INPUT_DOWN = 'DOWN';
	const INPUT_LEFT = 'LEFT';
	const INPUT_RIGHT = 'RIGHT';
	const INPUT_ACTION = 'ACTION';

	// Support: Touch events for mobile devices.
	//
	// Goals:
	// - Player can swipe or drag mostly anywhere on screen
	//   in order to move the dino. In particular, we want to
	//   consider touches on the board, and touches in the empty
	//   space below the board (e.g. in portrait mode).
	//
	// - Things outside outside the board can still be interacted
	//   with. Such as the footer link, and anything in modal dialogs.
	//
	// - Performing an action on a hitzone works by tapping.
	//
	// Caveats:
	// - We mostly disable pointer-events inside the board area
	//   (see CSS) to avoid scroll, text selection etc on desktop.
	//   In order to identify touch events from the board, we have
	//   enabled it on the board element, but disabled it for children.
	// - We must only call `e.preventDefault()` when the touch event
	//   is somewhere where we want game moves to be performed. Otherwise
	//   it would break links, buttons, dialogs, etc.
	// - Treasure zone objects must stay in the list at all times, even
	//   if they are no longer active. This is because otherwise, when the
	//   player leaves the zone area (swipe out), the touch event would stop
	//   matching `touchTargets.contains(target)` the moment the dino leaves
	//   the zone, thus wrongly letting the code think that this is a non-game
	//   touch.
	//
	// Look, dealing with Mobile Safari viewports is horrible. I had all sorts
	// of workarounds in place here but removed most of it in favour of having
	// the viewport just behave as it does by default. The player may zoom or
	// pan by accident, you'll have to find an edge outside the area and undo
	// that. Typing in a modal will do the native zoom/focus/scroll thing
	// as it does by default, and you may have to undo that too, etc. I found
	// this to be better in the end than going against the grain to disable
	// this (e.g. touch-action: none), and end up in an edge case where you're
	// stranded due to a native pan/zoom still happening unintentionally and
	// then can't get out of it.
	let touchTargets = new Set([
		// Player swipes on the board.
		board,
		// Player swipes in empty space below the board (esp in portrait mode).
		document.documentElement,
		document.body
	]);
	let touchState = null;
	const TOUCH_MIN_DISTANCE = 50;

	/**
	 * @typedef {Object} Zone
	 * @property {Element} object
	 * @property {Function} [onAction]
	 * @property {boolean} visible
	 */

	/** @type {Object<string,Zone>} */
	const hitZones = Object.create(null);
	/** @type {null|Zone} */
	let hitZoneCurrent = null;

	function coord(pos) {
		return pos.x + ',' + pos.y;
	}

	function size(int) {
		return Math.round(int * BOARD_GAP) + '%';
	}

	function renderDino(opts) {
		dino.style.top = size(dinoPos.y);
		dino.style.left = size(dinoPos.x);
		dino.hidden = false;
		if (opts && opts.face) {
			dino.classList.toggle('vault-dino--left', opts.face === FACE_LEFT);
		}

		if (hitZoneCurrent) {
			hitZoneCurrent.object.classList.remove('vault-zone--on');
			hitZoneCurrent = null;
		}

		const zone = hitZones[coord(dinoPos)];
		if (zone && zone.visible) {
			// In a zone
			hitZoneCurrent = zone;
			zone.object.classList.add('vault-zone--on');
		}
	}

	async function renderCaveLetter(index, letter) {
		return await new Promise(resolve => {
			requestAnimationFrame(() => {
				cave.dataset.text = cave.dataset.text.slice(0, index) + letter + cave.dataset.text.slice(index + 1);
				// Modern browsers aim for 60fps.
				// That's far too smoooth for this game.
				// Add more delay.
				setTimeout(resolve, 40);
			});
		});
	}

	async function renderCaveLetterFlickering(index, newer) {
		const older = cave.dataset.text[index] || '';

		await renderCaveLetter(index, '_');
		await renderCaveLetter(index, newer);
		await renderCaveLetter(index, '_');
		await renderCaveLetter(index, older);
		await renderCaveLetter(index, '_');
		await renderCaveLetter(index, newer);
	}

	async function queueCaveLetters(newText) {
		// Trim any excess old letters. From the back of course!
		for (let i = cave.dataset.text.length - 1; i >= newText.length; i--) {
			caveState.queue = caveState.queue
				.then(renderCaveLetter.bind(null, i, TEXT_NBSP))
				.then(renderCaveLetter.bind(null, i, '_'))
				.then(renderCaveLetter.bind(null, i, ''));
		}

		for (let i = 0; i < newText.length; i++) {
			caveState.queue = caveState.queue
				.then(renderCaveLetter.bind(null, i, newText[i]));
		}

		return caveState.queue;
	}

	async function queueCaveLettersFlickering(newText) {
		for (let i = 0; i < newText.length; i++) {
			caveState.queue = caveState.queue
				.then(renderCaveLetterFlickering.bind(null, i, newText[i]));
		}
		// Trim any excess placeholder letters.
		for (let i = newText.length; i < cave.dataset.text.length; i++) {
			caveState.queue = caveState.queue
				.then(renderCaveLetter.bind(null, newText.length, '_'))
				.then(renderCaveLetter.bind(null, newText.length, ''));
		}

		return caveState.queue;
	}

	async function renderCaveText() {
		// Use the final encrypted as text we display during the solving.
		// It's as good as any random text, but has the benefit of being
		// deterministic, consistent between people, possibly a red-herring,
		// and just seems neat to have the player and code work for the same prize!
		const placeholderSize = 10;
		// Give a sense of progress by sliding through the encrypted message
		// after each deposited token.
		const count = caveState.slots.filter(piece => piece !== null).length;
		const fromIdx = count * placeholderSize;
		// To ensure we always have enough to display, first re-arrange it so that
		// it wraps around (in case we'll reach the end).
		const rearranged = finalEncrypted.slice(fromIdx) + finalEncrypted.slice(0, fromIdx);
		const newPlaceholder = rearranged.slice(0, placeholderSize);

		if (count <= 0) {
			// Clear "Start".
			// Use a non-breaking space as otherwise CSS will hide the element entirely.
			queueCaveLetters(TEXT_NBSP);
			queueCaveLetters(newPlaceholder);
		} else if (count < caveState.slots.length) {

			// Run some numbers while the cave crunches the key from this token.
			titleSpotlight.hidden = false;
			queueCaveLettersFlickering(newPlaceholder);
			await caveState.queue;
			titleSpotlight.hidden = true;
		} else if (count === caveState.slots.length) {
			try {
				// Last crunching for this last token's key.
				titleSpotlight.hidden = false;
				queueCaveLettersFlickering(newPlaceholder);
				await caveState.queue;

				// Then, for the final encryption
				titleGradient.hidden = false;
				board.classList.add('vault-board--final');
				await queueCaveLettersFlickering(await aesGcmDecrypt(finalEncrypted, caveState.slots.join('')));

				// Credits
				document.documentElement.classList.add('vault--credits');
			} catch (e) {
				console.error('Internal Error: Failed to decrypt final message');
			}
		}
	}

	async function doTreasureModal({ titleText, contentHtml, secretEncrypted, hintText, hintHtml, maxLength }) {
		const mFocus = modal.querySelector('.vault-modal-autofocus');
		const mTitle = modal.querySelector('.vault-modal-title');
		const mContent = modal.querySelector('.vault-modal-content');
		const mFoot = modal.querySelector('.vault-modal-foot');
		const mInputLabel = document.createElement('label');
		const mInput = document.createElement('input');
		const mAlert = document.createElement('p');
		const mHint = document.createElement('details');
		let promiseResolve;

		async function runAction(action) {
			if (action === 'cancel') {
				close();
				return;
			}
			if (action === 'submit') {
				// Normalize (strip dots, strip spaces, lower that case).
				const passphraseCandidate = mInput.value.toLowerCase().replace(/[^0-9a-z]/g, '').trim();
				if (!passphraseCandidate.length) {
					// When submitting empty input by accident,
					// do not yet show any error message (or hint)
					mInput.focus();
					if (mInput.reportValidity) {
						// Let browser promote native validation message
						// e.g. if `<input required>` is set and input was empty.
						mInput.reportValidity();
					}
					return;
				}
				let secretPiece;
				try {
					secretPiece = await aesGcmDecrypt(secretEncrypted, passphraseCandidate);
					close(secretPiece);
				} catch (e) {
					// Wrong answer. Modal stays open.
					mAlert.hidden = false;
					mAlert.focus();
				}
			}
		}

		function onFootClick(e) {
			const action = e && e.target && e.target.dataset.action;
			if (action === 'cancel' || action === 'submit') {
				runAction(action);
			}
		}

		function onInputKeydown(e) {
			if (e.code === 'Enter') {
				e.preventDefault();
				runAction('submit');
			}
		}

		function onDocKeydown(e) {
			if (e.code === 'Escape') {
				e.preventDefault();
				runAction('cancel');
			}
		}

		function close(response) {
			modal.hidden = true;
			mFoot.removeEventListener('click', onFootClick);
			mInput.removeEventListener('keydown', onInputKeydown);
			document.removeEventListener('keydown', onDocKeydown);
			document.body.classList.remove('body--vault-modal-active');

			// Support iOS: Workaround keyboard oddly staying open.
			// Hiding the modal (thus display:none on input) is not
			// enough for the keyboard to go away.
			// Workaround by moving focus to non-input.
			board.focus();

			promiseResolve(response);
		}

		mTitle.textContent = titleText;
		mContent.innerHTML = contentHtml;

		mAlert.hidden = true;
		mAlert.tabIndex = 0;
		mAlert.className = 'alert alert--warn';
		mAlert.textContent = "Sorry, that's not it.";
		// https://webaim.org/techniques/formvalidation/#errors-on-top
		mContent.prepend(mAlert);

		mInput.required = true;
		mInput.maxLength = maxLength;
		// Disable input memory and other special behaviours, especially from mobile devices.
		mInput.autocapitalize = 'none';
		mInput.autocomplete = 'off';
		mInput.autocorrect = 'off';
		mInput.spellcheck = false;
		mInputLabel.append('Answer: ', mInput);
		mContent.append(mInputLabel);

		if (hintHtml || hintText) {
			mHint.classList.add('hint');
			mHint.append(
				Object.assign(document.createElement('summary'), { textContent: 'Hint' })
			);
			if (hintHtml) {
				mHint.insertAdjacentHTML('beforeend', hintHtml);
			} else {
				mHint.append(
					Object.assign(document.createElement('p'), { textContent: hintText })
				);
			}
			mContent.append(mHint);
		}

		document.addEventListener('keydown', onDocKeydown);
		mFoot.addEventListener('click', onFootClick);
		mInput.addEventListener('keydown', onInputKeydown);
		document.body.classList.add('body--vault-modal-active');
		modal.hidden = false;
		mFocus.focus();

		return new Promise(resolve => {
			promiseResolve = resolve;
		} );
	}

	async function doAlertModal({ titleText, contentHtml }) {
		const mFocus = modalConfirm.querySelector('.vault-modal-autofocus');
		const mTitle = modalConfirm.querySelector('.vault-modal-title');
		const mContent = modalConfirm.querySelector('.vault-modal-content');
		const mFoot = modalConfirm.querySelector('.vault-modal-foot');
		let promiseResolve;

		function onFootClick(e) {
			const action = e && e.target && e.target.dataset.action;
			if (action === 'confirm') {
				close();
			}
		}

		function onDocKeydown(e) {
			if (e.code === 'Escape') {
				e.preventDefault();
				close();
			}
		}

		function close() {
			modalConfirm.hidden = true;
			mFoot.removeEventListener('click', onFootClick);
			document.removeEventListener('keydown', onDocKeydown);
			document.body.classList.remove('body--vault-modal-active');
			promiseResolve();
		}

		mTitle.textContent = titleText;
		mContent.innerHTML = contentHtml;

		document.addEventListener('keydown', onDocKeydown);
		mFoot.addEventListener('click', onFootClick);
		document.body.classList.add('body--vault-modal-active');
		modalConfirm.hidden = false;
		mFocus.focus();

		return new Promise(resolve => {
			promiseResolve = resolve;
		} );
	}

	function input(action) {
		if (dinoLock) {
			// Disallow moving dino or performing actions while modal is open.
			return;
		}
		switch (action) {
			case INPUT_UP:
				dinoPos.y -= 1;
				if (dinoPos.y < -BOARD_BLEED) {
					dinoPos.y = BOARD_STEPS + BOARD_BLEED;
				}
				renderDino();
				break;
			case INPUT_DOWN:
				dinoPos.y += 1;
				if (dinoPos.y > (BOARD_STEPS + BOARD_BLEED)) {
					dinoPos.y = -BOARD_BLEED;
				}
				renderDino();
				break;
			case INPUT_LEFT:
				dinoPos.x -= 1;
				if (dinoPos.x < -BOARD_BLEED) {
					dinoPos.x = BOARD_STEPS + BOARD_BLEED;
				}
				renderDino({ face: FACE_LEFT });
				break;
			case INPUT_RIGHT:
				dinoPos.x += 1;
				if (dinoPos.x > (BOARD_STEPS + BOARD_BLEED)) {
					dinoPos.x = -BOARD_BLEED;
				}
				renderDino({ face: FACE_RIGHT });
				break;
			case INPUT_ACTION:
				if (hitZoneCurrent && hitZoneCurrent.onAction) {
					hitZoneCurrent.onAction();
				}
				break;
			default:
				throw new Error('Unknown input: ' + input);
		}
	}

	function onDocKeyDownMain(e) {
		if (dinoLock) {
			// Don't eat keys while typing in the modal.
			return;
		}
		if (e.target.tagName === 'INPUT') {
			// When volume control is focussed via tab control,
			// let arrow keys work as expected.
			return;
		}
		switch (e.code) {
			case 'KeyW':
			case 'ArrowUp':
				input(INPUT_UP);
				break;
			case 'KeyS':
			case 'ArrowDown':
				input(INPUT_DOWN);
				break;
			case 'KeyA':
			case 'ArrowLeft':
				input(INPUT_LEFT);
				break;
			case 'KeyD':
			case 'ArrowRight':
				input(INPUT_RIGHT);
				break;
			case 'Space':
				input(INPUT_ACTION);
				break;
			case 'Slash':
				if (e.shiftKey) {
					// Undocumented "do what I mean"
					// `Shift + Slash` is a question mark on most keyboards.
					// The documentation prefers the 'H' key, just in case.
					showHelp();
				}
				break;
			default:
				// Let browser handle other keys normally.
				return;
		}

		e.preventDefault();
	}

	function onDocKeyUpMain(e) {
		if (dinoLock) {
			// Don't eat keys while typing in the modal.
			return;
		}
		switch (e.code) {
			case 'KeyH':
				// Help modal is triggered by keyup instead of keydown.
				// This feels more natural, than opening the modal while
				// you're holding down the key still.
				showHelp();
				break;
			default:
				// Let browser handle other keys normally.
				return;
		}

		e.preventDefault();
	}

	function onTouchStartMain(e) {
		if (!touchTargets.has(e.target)) {
			// Let browser handle it.
			return;
		}

		e.preventDefault();

		touchState = {
			startX: e.touches[0].clientX,
			startY: e.touches[0].clientY,
			// This flips to true in onTouchMoveMain() if we've
			// at least one unit in a direction but keep dragging.
			// In this case, onTouchEndMain() must *not* turn any
			// last drag (shorter than the threshold) into a zone action.
			continuedMove: false,
		};
	}
	function onTouchMoveMain(e) {
		if (!touchTargets.has(e.target)) {
			// Let browser handle it.
			return;
		}

		e.preventDefault();

		if (!touchState) {
			return;
		}
		const touchCurrent = e.touches[0];
		// clientX: horizontal, left/right
		// clientY: vertical, up/down
		const diffX = touchState.startX - touchCurrent.clientX;
		const diffY = touchState.startY - touchCurrent.clientY;
		const distance = Math.max(Math.abs(diffX), Math.abs(diffY));
		if (distance < TOUCH_MIN_DISTANCE) {
			// Ignore, check again later during this touchmove
			return;
		}

		if (Math.abs(diffX) > Math.abs(diffY)) {
			if (diffX > 0) {
				input(INPUT_LEFT);
			} else {
				input(INPUT_RIGHT);
			}
		} else {
			if (diffY > 0) {
				input(INPUT_UP);
			} else {
				input(INPUT_DOWN);
			}
		}

		// Allow player to keep dragging in one motion to move continuously.
		touchState.startX = touchCurrent.clientX;
		touchState.startY = touchCurrent.clientY;
		touchState.continuedMove = true;
	}
	function onTouchEndMain(e) {
		if (!touchTargets.has(e.target)) {
			// Let browser handle it.
			return;
		}

		e.preventDefault();

		const isPossibleTreasureAction = (
			e.target.classList &&
			e.target.classList.contains('vault-zone--on')
		);
		if (isPossibleTreasureAction && !touchState.continuedMove) {
			input(INPUT_ACTION);
		}

		touchState = null;
	}

	function addZone({ object, where, onAction = null, initialVisibility = true }) {
		object.style.top = size(where.top);
		object.style.left = size(where.left);
		object.style.width = size(where.width);
		object.style.height = size(where.height);
		// Most objects are set to `hidden` in the HTML to avoid FOUC.
		object.hidden = false;

		// Reuse this object to allow later mutation in a way that
		// applies to each cell of the zone.
		// This is used for toggling cave zone visibility.
		const zoneObj = { object, onAction, visible: initialVisibility };

		for (let relX = 0; relX < where.width; relX++) {
			for (let relY = 0; relY < where.height; relY++) {
				const x = where.left + relX;
				const y = where.top + relY;
				hitZones[coord({ x, y })] = zoneObj;
			}
		}
		touchTargets.add(object);

		return zoneObj;
	}

	function addTreature({ object, where, clueText, questHtml, maxLength, hintText, hintHtml, token, secretEncrypted, caveSlot }) {
		let state = TREASURE_UNSOLVED;
		let secret;

		const tokenImg = document.createElement('img');
		tokenImg.src = token;
		tokenImg.height = '48';

		async function onTreasureOpen() {
			// It is allowed to open the next treasure while holding a
			// token that is not yet deposited. This makes it more fun
			// and explorative.
			// But, we do need to disallow claiming of a token whilst already
			// holding one.
			// (Holding multiple tokens is not supported.)
			// (Dropping tokens other than in the cave is also not supported.)
			if (state === TREASURE_UNSOLVED) {
				dinoLock = true;
				secret = await doTreasureModal({
					titleText: clueText,
					contentHtml: questHtml,
					secretEncrypted,
					maxLength,
					hintText,
					hintHtml,
				});
				if (secret !== undefined) {
					state = TREASURE_SOLVED;
					object.classList.add('vault-treasure--solved');
					object.append(tokenImg);
				}
				dinoLock = false;
			} else if (state === TREASURE_SOLVED && secret !== undefined) {
				if (!dinoHolding) {
					dinoHolding = {
						tokenImg,
						caveSlot,
						secret
					};
					state = TREASURE_CLAIMED;
					secret = undefined;

					// Player earns cave visibility after first treasure claim.
					caveState.zone.visible = true;
					caveState.campZone.visible = true;

					dino.append(tokenImg);
					dino.classList.add('vault-dino--holding');
				}
			} else {
				// Ignore, nothing here now.
			}
		}

		addZone({ object, where, onAction: onTreasureOpen });
	}

	function addCave({ object, where }) {
		async function onCaveAction() {
			if (dinoHolding) {
				caveState.slots[dinoHolding.caveSlot] = dinoHolding.secret;
				object.append(dinoHolding.tokenImg);
				renderCaveText();
				dinoHolding = false;
			}
		}

		caveState.zone = addZone({
			object,
			where,
			onAction: onCaveAction,
			initialVisibility: false
		});
	}

	async function showHelp() {
		dinoLock = true;
		await doAlertModal({
			titleText: 'Help',
			contentHtml: `
			<p>Your mission, should you choose to accept it, is to find
			and unlock four treasures.</p>
			<p>Each treasure holds a key to deciphering the main answer.</p>`,
		});
		dinoLock = false;
	}

	function start() {
		board.removeEventListener('click', onBoardClickStart);
		document.removeEventListener('keydown', onDocKeyUpStart);

		addTreature({
			object: document.getElementById('vault-treasure-a'),
			where: { top: 0, left: 0, width: 5, height: 4 },
			clueText: 'Eyes Ate, Deeze Tree',
			questHtml: '<p>Encoded message: <code>7 4 0 17 19 18</code></p>',
			hintText: `Deeze Tree. But, if Bees To, then Dee would've been Fore.`,
			maxLength: 20,
			token: 'lib/love.png',
			secretEncrypted: '51f22275a722f8a6aadeed69TiDRV465+Io58Kw78//onmnLLcrKh8rtogx4rwS1+pg=',
			caveSlot: 0,
		});

		addTreature({
			object: document.getElementById('vault-treasure-b'),
			where: { top: 0, left: BOARD_STEPS - 5, width: 5, height: 4 },
			clueText: 'Clasp on a cope',
			questHtml: `<p>Encoded message:</p><blockquote>
					Dit dah dit dit<span class="vault-clasp-decor">.</span><br>
					Dah fah lah<span class="vault-clasp-decor">...</span><br>
					Dit fah sit<span class="vault-clasp-decor">.</span><br>
					Sit pit<span class="vault-clasp-decor">!</span><br>
					Fah lah fah<span class="vault-clasp-decor">!!!</span><br>
					Dah<span class="vault-clasp-decor">.</span>
				</blockquote>`,
			hintHtml: `<p>This international code bears the same name as the clasp of a [[Cope]].</p>
			<p>The message encodes one letter per line.</p>`,
			maxLength: 20,
			token: 'lib/rubber-duck.png',
			secretEncrypted: 'a4175e0557d8828cc1d71ad6z91G9SPbcFaFZcf9n5WYsO6/U21x0xzCnqohQmynN+0=',
			caveSlot: 1,
		});

		addTreature({
			object: document.getElementById('vault-treasure-c'),
			where: { top: BOARD_STEPS - 4, left: 0, width: 5, height: 4 },
			clueText: 'Decode 👤 == 🫖?',
			questHtml: '<p>Decode this message: <code>Are you as tea?</code>.</p>',
			hintText: 'Allow me to spell it out this 4-letter word.',
			maxLength: 5,
			token: 'lib/diamond.png',
			secretEncrypted: 'ac2b85cb9699b6d6437089bd7wZgtZNlpCSrG7QURCwyWhAZl+XB9oCmxracLwLjghk=',
			caveSlot: 2,
		});

		addTreature({
			object: document.getElementById('vault-treasure-d'),
			where: { top: BOARD_STEPS - 4, left: BOARD_STEPS - 5, width: 5, height: 4 },
			clueText: `Christian Kramp would've loved this!`,
			questHtml: '<p>The answer is 7!</code>',
			hintText: `Christian Kramp. The "A000142" sequence might help, too.`,
			maxLength: 5,
			token: 'lib/coin.png',
			secretEncrypted: 'ac78cb33c6e6e9cdc3323336kkZ2O0rAQBEJyaSzDSnLHZkY3Y8AtS+MAeHH1FQrRA4=',
			caveSlot: 3,
		});
		caveState.campZone = addZone({
			object: document.getElementById('vault-camp'),
			where: { top: 9, left: 6, width: 2, height: 2 },
			initialVisibility: false
		});

		renderDino();
		renderCaveText();
		board.classList.add('vault-board--started')

		document.addEventListener('keydown', onDocKeyDownMain);
		document.addEventListener('keyup', onDocKeyUpMain);
		document.addEventListener('touchstart', onTouchStartMain, { passive: false });
		document.addEventListener('touchmove', onTouchMoveMain, { passive: false });
		document.addEventListener('touchend', onTouchEndMain, { passive: false });

		// I initially had the game render without a "Start" phase,
		// and upon first relevant in-game keydown, we'd start the music.
		// (Cannot do earlier, since that's denied by autoplay restrictions,
		// and would likely be annoying in that case too.)
		//
		// But, it seems in Firefox keydown events don't count as relevant
		// interactions, only keyup and click. So, hence the start phase,
		// completed by either click, or Space keyup.
		//
		// After that, we can start the music any time. And might as well,
		// do it right away in that case.
		if (!audioState.startedMain) {
			audioState.startedMain = true;
			audioMain.play();
		}
	}

	// init

	addCave({
		object: cave,
		where: { top: 9, left: 8, width: 4, height: 2 }
	});

	function onBoardClickStart() {
		start();
	}
	board.addEventListener('click', onBoardClickStart);

	function onDocKeyUpStart(e) {
		if (e.code === 'Space' || e.code === 'Enter') {
			start();
			e.preventDefault();
		}
	}
	document.addEventListener('keydown', onDocKeyUpStart);

	volumeInput.addEventListener('input', e => {
		// Throws DOMException if invalid. Leave unhandled since our HTML shouldn't cause
		// that anyway. It it does happen, it only affects this event call stack (nothing else),
		// and is useful to report as-is.
		audioMain.volume = volumeInput.value;
		// It's a bit nicer if the music paused while volume is zero, but then we also
		// have to avoid it from starting if the slider is engaged before "Start". Keep it simple.
		if (volumeInput.value === '0') {
			volumeInputWrap.classList.add('vault-kb-volume-wrap--muted');
		} else {
			volumeInputWrap.classList.remove('vault-kb-volume-wrap--muted');
		}
	});
	if (VOLUME_DEFAULT === '0') {
		volumeInputWrap.classList.add('vault-kb-volume-wrap--muted');
	}

	audioMain.loop = true;
	audioMain.volume = VOLUME_DEFAULT;
	// While Firefox often doesn't show audio network requests,
	// it does seem to preload by default. Use Private browsing to debug.
	// Ref <https://bugzilla.mozilla.org/show_bug.cgi?id=1504608>.
	//
	// Support iOS: Avoid missing connection with system-level playback control.
	// If we call audioMain.load() here, then later when we play it will
	// not show up in the native system control as currently playing
	// (and thus not pausable). Whatever.
	audioMain.preload = '';

	// eslint-disable-next-line no-unused-vars
	async function development() {
		// titleGradient.hidden = false;
		// titleSpotlight.hidden = false;

		/*
		// Final key: a [0-9A-Za-z]{64} random password that was split into four pieces,
		// each hidden in a treasure as their encrypted message.
		// Final message = final answer.
		// const finalKey = '';
		// const finalMessage = '';
		// const finalEncrypted = await aesGcmEncrypt(finalMessage, finalKey);
		// console.log(finalEncrypted);
		// const finalEncrypted = '';
		// console.log(await aesGcmDecrypt(finalEncrypted, finalKey));

		// const finalKeyPieceSize = Math.ceil(finalKey.length / 4);
		// const finalKeyPieces = [
		// 	finalKey.slice(0, finalKeyPieceSize),
		// 	finalKey.slice(finalKeyPieceSize, 2 * finalKeyPieceSize),
		// 	finalKey.slice(2 * finalKeyPieceSize, 3 * finalKeyPieceSize),
		// 	finalKey.slice(3 * finalKeyPieceSize),
		// ];
		// console.log(finalKeyPieces, finalKeyPieces.join('') === finalKey);
		// console.log(await aesGcmDecrypt(finalEncrypted, finalKeyPieces.join('')));


		// Treasure key: Answer to a quest.
		// Treasure message: Part of the final key.
		for (let treasureKey of [
			'',
			'',
			'',
			''
		]) {
			console.log(treasureKey, await aesGcmEncrypt(finalKeyPieces.shift(), treasureKey));
		};
		*/
	}
	// development();
}

main();

/*! (c) Chris Veness | MIT Licence | https://gist.github.com/Krinkle/58dd2281c033e3626ce2e7f20e85aaf4 */
// eslint-disable-next-line no-unused-vars
async function aesGcmEncrypt(plaintext, password) {
    const pwUtf8 = new TextEncoder().encode(password);
    const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const alg = { name: 'AES-GCM', iv: iv };
    const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);
    const ptUint8 = new TextEncoder().encode(plaintext);
    const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8);
    const ctArray = Array.from(new Uint8Array(ctBuffer));
    const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');
    const ctBase64 = btoa(ctStr);
    const ivHex = Array.from(iv).map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return ivHex + ctBase64;
}

async function aesGcmDecrypt(ciphertext, password) {
    const pwUtf8 = new TextEncoder().encode(password);
    const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
    const iv = ciphertext.slice(0,24).match(/.{2}/g).map(byte => parseInt(byte, 16));
    const alg = { name: 'AES-GCM', iv: new Uint8Array(iv) };
    const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);
    const ctStr = atob(ciphertext.slice(24));
    const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)));
    const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8);
    const plaintext = new TextDecoder().decode(plainBuffer);
    return plaintext;
}
