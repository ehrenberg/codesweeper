(function($) {
	/*
	 * Eingaben
	 */
	var Listener = function(options) {
		this._init(options);
	};
	$.extend(Listener,{
			_EVENT_BUTTON_LEFT: 1,
			_EVENT_BUTTON_RIGHT: 2,
			_EVENT_BUTTON_BOTH: 3,
			_EVENT_WHICH_LEFT: 1,
			_EVENT_WHICH_RIGHT: 3,
			_DEFAULT_SETTINGS: {
		onCellLeftMouseDown: $.noop,
		onCellRightMouseDown: $.noop,
		onCellBothMouseDown: $.noop,
		onCellLeftMouseUp: $.noop,
		onCellRightMouseUp: $.noop,
		onCellBothMouseUp: $.noop,
		onCellLeftMouseOver: $.noop,
		onCellRightMouseOver: $.noop,
		onCellBothMouseOver: $.noop,
		onCellLeftMouseOut: $.noop,
		onCellRightMouseOut: $.noop,
		onCellBothMouseOut: $.noop
	}});
	$.extend(Listener.prototype, {
		_init: function(options) {
			this._options = $.extend({}, Listener._DEFAULT_SETTINGS, options || {});
			this._buttonKey = 0;
			var listener = this;
			$(document).mouseup(function() {
				listener._buttonKey = 0;
			});
		},
		_reset: function() {
			this._triggers = this._options;
		},
		_stop: function() {
			this._triggers = Listener._DEFAULT_SETTINGS;
		},
		_onCellMouseDown: function(ev, idx) {
			var buttonKey = 0;
			if (ev.button !== undefined) {
				if (ev.button === 0) {
					buttonKey = Listener._EVENT_BUTTON_LEFT;
				} else {
					buttonKey = ev.button & Listener._EVENT_BUTTON_BOTH;
				}
			} else if (ev.which !== undefined) {
				if (ev.which === Listener._EVENT_WHICH_LEFT) {
					buttonKey = Listener._EVENT_BUTTON_LEFT;
				} else if (ev.which === Listener._EVENT_WHICH_RIGHT) {
					buttonKey = Listener._EVENT_BUTTON_RIGHT;
				} else {
					buttonKey = 0;
				}
			}
			this._buttonKey |= buttonKey;
			if (this._buttonKey === Listener._EVENT_BUTTON_LEFT) {
				this._triggers.onCellLeftMouseDown(idx);
			} else if (this._buttonKey === Listener._EVENT_BUTTON_RIGHT) {
				this._triggers.onCellRightMouseDown(idx);
			} else if (this._buttonKey === Listener._EVENT_BUTTON_BOTH) {
				this._triggers.onCellBothMouseDown(idx);
			}
		},
		_onCellMouseUp: function(ev, idx) {
			if (this._buttonKey === 0) {
				return;
			}
			var buttonKey = this._buttonKey;
			this._buttonKey = 0;
			if (buttonKey === Listener._EVENT_BUTTON_LEFT) {
				this._triggers.onCellLeftMouseUp(idx);
			} else if (buttonKey === Listener._EVENT_BUTTON_RIGHT) {
				this._triggers.onCellRightMouseUp(idx);
			} else if (buttonKey === Listener._EVENT_BUTTON_BOTH) {
				this._triggers.onCellBothMouseUp(idx);
			}
		},
		_onCellMouseOver: function(ev, idx) {
			if (this._buttonKey === 0) {
				return
			}
			if (this._buttonKey === Listener._EVENT_BUTTON_LEFT) {
				this._triggers.onCellLeftMouseOver(idx)
			} else if (this._buttonKey === Listener._EVENT_BUTTON_RIGHT) {
				this._triggers.onCellRightMouseOver(idx)
			} else if (this._buttonKey === Listener._EVENT_BUTTON_BOTH) {
				this._triggers.onCellBothMouseOver(idx)
			}
		},
		_onCellMouseOut: function(ev, idx) {
			if (this._buttonKey === 0) {
				return
			}
			if (this._buttonKey === Listener._EVENT_BUTTON_LEFT) {
				this._triggers.onCellLeftMouseOut(idx)
			} else if (this._buttonKey === Listener._EVENT_BUTTON_RIGHT) {
				this._triggers.onCellRightMouseOut(idx)
			} else if (this._buttonKey === Listener._EVENT_BUTTON_BOTH) {
				this._triggers.onCellBothMouseOut(idx)
			}
		},
	});
	
	
	
	/*
	 * Smiley. Änderung des Status
	 * 
	 */
	var Smiley = function(target, status) {
		this._init(target, status);
	}; $.extend(Smiley, {
		_STATE_CLASS: 'codesweeper-smiley',
		_STATE_SMILE: '01',
		_STATE_WONDER: '02',
		_STATE_COOL: '03',
		_STATE_DEAD: '04',
	});
	$.extend(Smiley.prototype, {
		_init: function($target, status) {
			this._$elemSmiley = $($target);
			this._status = status;
		},
		_setState: function(status) {
			switch(status) {
				case 1:
					this._$elemSmiley.addClass('smiley-state01');
					this._$elemSmiley.removeClass('smiley-state02');
					this._$elemSmiley.removeClass('smiley-state03');
					this._$elemSmiley.removeClass('smiley-state04');
				break;
				case 2:
					this._$elemSmiley.addClass('smiley-state02');
					this._$elemSmiley.removeClass('smiley-state01');
					this._$elemSmiley.removeClass('smiley-state03');
					this._$elemSmiley.removeClass('smiley-state04');
				break;
				case 3:
					this._$elemSmiley.addClass('smiley-state03');
					this._$elemSmiley.removeClass('smiley-state01');
					this._$elemSmiley.removeClass('smiley-state02');
					this._$elemSmiley.removeClass('smiley-state04');
				break;
				case 4:
					this._$elemSmiley.addClass('smiley-state04');
					this._$elemSmiley.removeClass('smiley-state01');
					this._$elemSmiley.removeClass('smiley-state02');
					this._$elemSmiley.removeClass('smiley-state03');
				break;
			}
		}
	});



	/*
	 * Spielfeld
	 */
	var Board = function(target, options) {
		this._init(target, options);
	}; $.extend(Board, {
		_STATE_CLASS: 'codesweeper-state',
		_STATE_HIDDEN: '0',
		_STATE_NOT_MARKED: '01',
		_STATE_FLAGGED: '0f',
		_STATE_UNCERTAIN: '0h',
		_STATE_OPENED: '1',
		_STATE_FREE: '10',
		_STATE_MINE: '19',
		_STATE_EXPLOSION: '1a',
		_STATE_FAULT: '1b',
		_HAS_MINE: 1,
		_HAS_FLAG: 2
	}); $.extend(Board.prototype, {
		_init: function(target, options) {
			this._$cells = target;
			
			var arrBoard = new Array(this._$cells.length + 1).join('"' + Board._STATE_NOT_MARKED + '",');
			this._initBoardState = "[" + arrBoard.slice(0, -1) + "]";

			//Listener Erstellen
			var listener = new Listener(options);
			this._$cells.each(function(idx) {
				$(this).mousedown(function(ev) {
					listener._onCellMouseDown(ev, idx);
				}).mouseover(function(ev) {
					listener._onCellMouseOver(ev, idx);
				}).mouseout(function(ev) {
					listener._onCellMouseOut(ev, idx);
				}).mouseup(function(ev) {
					listener._onCellMouseUp(ev, idx);
				})
			});
			this._listener = listener;
		},
		_reset: function() {
			this._boardStates = $.parseJSON(this._initBoardState);
			this._$cells.removeClass().addClass(Board._STATE_CLASS + Board._STATE_NOT_MARKED);
			this._arrFlags = {};
			this._listener._reset();
			this._started = !1
		},
		_start: function(mines, excludes) {
			var board = this;
			new MineGenerator(this._$cells.length, function(idx) {
				board._setFlag(idx, Board._HAS_MINE);
			})._generate(mines, excludes);
			this._started = !0;
		},
		_stop: function() {
			this._listener._stop()
		},
		_getState: function(idx) {
			return this._boardStates[idx]
		},
		_setState: function(idx, state) {
			this._boardStates[idx] = state;
			this._$cells.eq(idx).removeClass().addClass(Board._STATE_CLASS + state)
		},
		_isHidden: function(idx) {
			return this._getState(idx).charAt(0) === Board._STATE_HIDDEN
		},
		_isNotMarked: function(idx) {
			return this._getState(idx) === Board._STATE_NOT_MARKED
		},
		_isFlagged: function(idx) {
			return this._getState(idx) === Board._STATE_FLAGGED
		},
		_isUncertain: function(idx) {
			return this._getState(idx) === Board._STATE_UNCERTAIN
		},
		_isOpened: function(idx) {
			return this._getState(idx).charAt(0) === Board._STATE_OPENED
		},
		_getMineCount: function(idx) {
			return parseInt(this._getState(idx), 10) - 10
		},
		_setNotMarked: function(idx) {
			this._setState(idx, Board._STATE_NOT_MARKED)
		},
		_setFlagged: function(idx) {
			this._setState(idx, Board._STATE_FLAGGED);
			this._setFlag(idx, Board._HAS_FLAG)
		},
		_setUncertain: function(idx) {
			this._setState(idx, Board._STATE_UNCERTAIN);
			this._unsetFlag(idx, Board._HAS_FLAG)
		},
		_setMineCount: function(idx, count) {
			this._setState(idx, Board._STATE_OPENED + count)
		},
		_setMine: function(idx) {
			this._setState(idx, Board._STATE_MINE)
		},
		_setExplosion: function(idx) {
			this._setState(idx, Board._STATE_EXPLOSION)
		},
		_setMistake: function(idx) {
			this._setState(idx, Board._STATE_FAULT)
		},
		_isFixed: function(idx) {
			var state = this._getState(idx);
			if (state === Board._STATE_NOT_MARKED) {
				return !1
			}
			if (state === Board._STATE_UNCERTAIN) {
				return !1
			}
			return !0
		},
		_press: function(idx) {
			if (this._isFixed(idx)) {
				return
			}
			this._$cells.eq(idx).removeClass().addClass(Board._STATE_CLASS + Board._STATE_FREE)
		},
		_release: function(idx) {
			if (this._isFixed(idx)) {
				return
			}
			var state = this._getState(idx);
			this._$cells.eq(idx).removeClass().addClass(Board._STATE_CLASS + state)
		},
		_getFlag: function(idx) {
			var flag = this._arrFlags[idx];
			return flag === undefined ? 0 : flag
		},
		_hasMine: function(idx) {
			return this._getFlag(idx) & Board._HAS_MINE
		},
		_setFlag: function(idx, val) {
			if (this._arrFlags[idx] === undefined) {
				this._arrFlags[idx] = val
			} else {
				this._arrFlags[idx] |= val
			}
		},
		_unsetFlag: function(idx, val) {
			if (this._arrFlags[idx] !== undefined) {
				this._arrFlags[idx] &= ~val;
				if (!this._arrFlags[idx]) {
					delete this._arrFlags[idx]
				}
			}
		},
		_eachFlag: function(callback) {
			$.each(this._arrFlags, callback)
		}
	});
	
	
	
	/*
	 * Minen zufällig verteilen
	 */
	var MineGenerator = function(cells, mines) {
		this._init(cells, mines);
	}; $.extend(MineGenerator.prototype, {
		_init: function(cells, mines) {
			this._cells = cells;
			this._setMine = mines;
		},
		_generate: function(mines, excludes) {
			var generator = this;
			this._reserved = $.extend([], excludes);
			this._reserved.push(".");
			this._emptyCells = this._cells - excludes.length;
			for (; mines > 0; --mines) {
				generator._insert()
			}
		},
		_insert: function() {
			var generator = this;
			var idx = Math.floor(Math.random() * this._emptyCells);
			$.each(this._reserved, function(i, val) {
				if (val === "." || val > idx) {
					generator._reserved.splice(i, 0, idx);
					generator._emptyCells--;
					generator._setMine(idx);
					return !1
				} else {
					++idx
				}
			})
		}
	});
	
	
	/*
	 * GAME
	 */
	var CodeSweeper = function(target, options) {
		this._init(target, options)
	}; $.extend(CodeSweeper, {
		_DEFAULT_LEVELS: {
			easy: {
				width: 9,
				height: 9,
				mines: 10
			},
			medium: {
				width: 16,
				height: 16,
				mines: 40
			},
			hard: {
				width: 34,
				height: 20,
				mines: 170
			},
			custom: {}
		},
		_WIDTH_MIN: 9,
		_HEIGHT_MIN: 9,
		_WIDTH_MAX: 30,
		_HEIGHT_MAX: 24,
		_MINES_MIN: 10,
		_TIMER_UPDATE_INTERVAL: '1s',
		_TIMER_MAX_COUNT: 9999
	}); $.extend(CodeSweeper.prototype, {
		_init: function(target, options) {
			this._$target = $(target);
			this._options = options;
			this._initSize()
		},
		_initSize: function() {
			$.extend(this._options, CodeSweeper._DEFAULT_LEVELS[this._options.difficulty] || {});
			this._width = parseInt(this._options.width, 10);
			if (isFinite(this._width)) {
				if (this._width < CodeSweeper._WIDTH_MIN) {
					this._width = CodeSweeper._WIDTH_MIN
				}
				if (this._width > CodeSweeper._WIDTH_MAX) {
					this._width = CodeSweeper._WIDTH_MAX
				}
			} else {
				this._width = CodeSweeper._WIDTH_MIN
			}
			this._height = parseInt(this._options.height, 10);
			if (isFinite(this._height)) {
				if (this._height < CodeSweeper._HEIGHT_MIN) {
					this._height = CodeSweeper._HEIGHT_MIN
				}
				if (this._height > CodeSweeper._HEIGHT_MAX) {
					this._height = CodeSweeper._HEIGHT_MAX
				}
			} else {
				this._height = CodeSweeper._HEIGHT_MIN
			}
			this._cells = this._width * this._height;
			this._mines = parseInt(this._options.mines, 10);
			if (isFinite(this._mines)) {
				if (this._mines < CodeSweeper._MINES_MIN) {
					this._mines = CodeSweeper._MINES_MIN
				}
				var maxMines = Math.floor(this._width * this._height * 0.94 - 8.45);
				if (this._mines > maxMines) {
					this._mines = maxMines
				}
			} else {
				var percent = 10 + Math.floor(this._cells / 45);
				this._mines = Math.round(this._cells * percent / 1000) * 10
			}
		},
		_show: function() {
			var game = this;
			this._$target.html(this._generateHtml());
			this._smiley = new Smiley('.codesweeper-smiley', 1);
			this._board = new Board(this._$target.find(".codesweeper-cells > span"), {
				onCellLeftMouseDown: function(idx) {
					game._onCellLeftMouseDown(idx)
				},
				onCellLeftMouseOver: function(idx) {
					game._onCellLeftMouseOver(idx)
				},
				onCellLeftMouseOut: function(idx) {
					game._onCellLeftMouseOut(idx)
				},
				onCellLeftMouseUp: function(idx) {
					game._onCellLeftMouseUp(idx)
				},
				onCellRightMouseDown: function(idx) {
					game._onCellRightMouseDown(idx)
				},
				onCellBothMouseDown: function(idx) {
					game._onCellBothMouseDown(idx)
				},
				onCellBothMouseOver: function(idx) {
					game._onCellBothMouseOver(idx)
				},
				onCellBothMouseOut: function(idx) {
					game._onCellBothMouseOut(idx)
				},
				onCellBothMouseUp: function(idx) {
					game._onCellBothMouseUp(idx)
				}
			});
			this._$elemMines = this._$target.find(".codesweeper-mines");
			this._$elemTimer = this._$target.find(".codesweeper-timer");			
			this._$elemSmiley = this._$target.find(".codesweeper-smiley");
			this._$btnRestart = this._$target.find(".codesweeper-restart");
			this._$elemMines.before('Minen');
			this._$elemTimer.before('Zeit');
			this._$btnRestart.text('Neustarten');
			this._$btnRestart.click(function() {
				game._resetGame()
			});
			this._resetGame()
		},
		_generateHtml: function() {
			var idx;
			var html = '';
			html += '<button type="button" class="pure-button codesweeper-restart"></button>';
			html += '<span class="codesweeper-smiley" ></span><div style="clear:both;"></div>';
			html += '<form class="codesweeper-form pure-form">';
			
			html += '<div class="codesweeper-head">';
			html += '<span class="codesweeper-mines" ></span>';
			html += '<span class="codesweeper-timer" ></span>';
			html += '</div>';
			html += '<div class="codesweeper-cells" >';
			for (idx = 0; idx < this._cells; idx++) {
				if (idx > 0 && idx % this._width === 0) {
					html += '<br />';
				}
				html += '<span></span>';
			}
			html += '</div>';
			
			html += '</nobr>';
			html += '</form>';
			return html
		},
		_onCellLeftMouseDown: function(idx) {
			this._board._press(idx)
		},
		_onCellLeftMouseOver: function(idx) {
			this._board._press(idx)
		},
		_onCellLeftMouseOut: function(idx) {
			this._board._release(idx)
		},
		_onCellLeftMouseUp: function(idx) {
			if (!this._board._started) {
				this._startGame(idx);
			}
			if (this._board._isFixed(idx)) {
				return;
			}
			if (this._board._hasMine(idx)) {
				this._explosion.push(idx);
				this._gameOver();
				return;
			}
			this._openSafe(idx);
		},
		_onCellRightMouseDown: function(idx) {
			var mines;
			if (this._board._isOpened(idx)) {
				return
			}
			if (this._board._isNotMarked(idx)) {
				this._board._setFlagged(idx);
				mines = parseInt(this._$elemMines.text(), 10);
				this._$elemMines.text(mines - 1)
			} else if (this._board._isFlagged(idx)) {
				this._board._setUncertain(idx);
				mines = parseInt(this._$elemMines.text(), 10);
				this._$elemMines.text(mines + 1)
			} else if (this._board._isUncertain(idx)) {
				this._board._setNotMarked(idx)
			}
		},
		_onCellBothMouseDown: function(idx) {
			var game = this;
			$.each(this._neighbors(idx), function(i, neighbor) {
				game._board._press(neighbor)
			})
		},
		_onCellBothMouseOver: function(idx) {
			var game = this;
			$.each(this._neighbors(idx), function(i, neighbor) {
				game._board._press(neighbor)
			})
		},
		_onCellBothMouseOut: function(idx) {
			var game = this;
			$.each(this._neighbors(idx), function(i, neighbor) {
				game._board._release(neighbor)
			})
		},
		_onCellBothMouseUp: function(idx) {
			var game = this;
			$.each(this._neighbors(idx), function(i, neighbor) {
				game._board._release(neighbor)
			});
			if (this._board._isHidden(idx)) {
				return
			}
			var mineCount = this._board._getMineCount(idx);
			var flagCount = 0;
			var safe = [];
			var explosion = [];
			$.each(this._surroundings(idx), function(i, neighbor) {
				if (game._board._isOpened(neighbor)) {
					return
				}
				var flag = game._board._getFlag(neighbor);
				if (flag & Board._HAS_FLAG) {
					flagCount++;
					return
				}
				if (flag & Board._HAS_MINE) {
					explosion.push(neighbor);
					return
				}
				safe.push(neighbor);
			});
			if (flagCount !== mineCount) {
				return
			}
			$.each(safe, function(i, idx) {
				game._openSafe(idx);
			});
			if (explosion.length > 0) {
				this._explosion = explosion;
				this._gameOver();
			}
		},
		_resetGame: function() {
			if ($.timer) {
				this._$elemTimer.stopTime()
			}
			this._$elemTimer.text("0");
			this._unopened = this._cells - this._mines;
			this._explosion = [];
			this._board._reset();
			this._$elemMines.text(this._mines);
			
			this._smiley._setState(1);
		},
		_startGame: function(idx) {
			this._board._start(this._mines, this._neighbors(idx));
			if ($.timer) {
				this._$elemTimer.text("1");
				this._$elemTimer.everyTime(CodeSweeper._TIMER_UPDATE_INTERVAL, function() {
					$(this).text($(this).text() - 0 + 1)
				}, CodeSweeper._TIMER_MAX_COUNT - 1)
			}
			this._smiley._setState(1);
		},
		_stopGame: function() {
			if ($.timer) {
				this._$elemTimer.stopTime()
			}
			this._board._stop();
			this._smiley._setState(4);
		},
		_gameClear: function() {
			var game = this;
			this._stopGame();
			this._board._eachFlag(function(idx, mf) {
				if (mf === Board._HAS_MINE) {
					game._board._setFlagged(idx)
				}
			});
			this._$elemMines.text("0");
			$('body').after('<div id="dialog"><h1 style="text-align:center;">Sie haben gewonnen!</h1></div>');
			$( "#dialog" ).dialog({
				width:450,
				height:150,
				autoOpen: true,
				show: {
					effect: "explode",
					duration: 600
				},
				hide: {
					effect: "explode",
					duration: 600
				}
			});
			this._smiley._setState(3);
		},
		_gameOver: function() {
			var game = this;
			this._stopGame();
			this._board._eachFlag(function(idx, mf) {
				if (mf === Board._HAS_MINE) {
					game._board._setMine(idx)
				} else if (mf === Board._HAS_FLAG) {
					game._board._setMistake(idx)
				}
			});
			$.each(this._explosion, function(i, idx) {
				game._board._setExplosion(idx)
			});
			this._smiley._setState(4);
		},
		_openSafe: function(idx) {
			if (this._board._isOpened(idx)) {
				return
			}
			var game = this;
			var mineCount = 0;
			var nextOpen = [];
			$.each(this._surroundings(idx), function(i, neighbor) {
				if (game._board._isOpened(neighbor)) {
					return
				}
				var flag = game._board._getFlag(neighbor);
				if (flag & Board._HAS_MINE) {
					mineCount++;
					return
				}
				if (flag & Board._HAS_FLAG) {
					return
				}
				nextOpen.push(neighbor)
			});
			this._board._setMineCount(idx, mineCount);
			this._unopened--;
			if (this._unopened <= 0) {
				this._gameClear();
				return
			}
			if (mineCount === 0) {
				$.each(nextOpen, function(i, neighbor) {
					game._openSafe(neighbor)
				})
			}
			this._smiley._setState(2);
			setTimeout(function(){
				game._smiley._setState(1);
			}, 1000);
		},
		_surroundings: function(idx) {
			return this._neighbors(idx, !0);
		},
		_neighbors: function(idx, notme) {
			var game = this;
			var neighbors = [];
			var x1 = idx % this._width;
			var y1 = idx - x1;
			$.each([y1 - game._width, y1, y1 + game._width], function(i, y2) {
				if (y2 < 0 || y2 >= game._cells) {
					return;
				}
				$.each([x1 - 1, x1, x1 + 1], function(i, x2) {
					if (notme && y2 === y1 && x2 === x1) {
						return;
					}
					if (x2 < 0 || x2 >= game._width) {
						return;
					}
					neighbors.push(y2 + x2)
				});
			});
			return neighbors;
		}
	}); $.codesweeper = {}; $.codesweeper.version = "1.0.0"; $.codesweeper.defaults = {
		difficulty: 'hard'
	}; $.extend($.codesweeper.defaults); $.fn.codesweeper = function(options) {
		var options = $.extend({}, $.codesweeper.defaults, options || {});
		return $(this).each(function() {
			new CodeSweeper(this, options)._show();
		});
	}
})(jQuery)