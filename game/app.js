!function(t) {
    var e = {};

    function i(r) {
        if (e[r]) return e[r].exports;
        var s = e[r] = {
            i: r,
            l: !1,
            exports: {}
        };
        return t[r].call(s.exports, s, s.exports, i), s.l = !0, s.exports
    }
    i.m = t,
    i.c = e,
    i.d = function(t, e, r) {
        i.o(t, e) || Object.defineProperty(t, e, {
            enumerable: !0,
            get: r
        })
    },
    i.r = function(t) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
            value: "Module"
        }),
        Object.defineProperty(t, "__esModule", {
            value: !0
        })
    },
    i.t = function(t, e) {
        if (1 & e && (t = i(t)), 8 & e) return t;
        if (4 & e && "object" == typeof t && t && t.__esModule) return t;
        var r = Object.create(null);
        if (i.r(r), Object.defineProperty(r, "default", {
            enumerable: !0,
            value: t
        }), 2 & e && "string" != typeof t) for (var s in t) i.d(r, s, function(e) {
            return t[e]
        }.bind(null, s));
        return r
    },
    i.n = function(t) {
        var e = t && t.__esModule ? function() {
            return t.default
        } : function() {
            return t
        };
        return i.d(e, "a", e), e
    },
    i.o = function(t, e) {
        return Object.prototype.hasOwnProperty.call(t, e)
    },
    i.p = "",
    i(i.s = 2)
}([function(t, e, i) {
    "use strict";
    i.d(e, "a", (function() {
        return r
    }));
    const r = "https://k-ext.pages.dev/"
}, , function(t, e, i) {
    "use strict";
    i.r(e);
    class r {
        constructor(t, e, i) {
            this.x = t, this.y = e, this.dir = i
        }
        collides(t) {
            return this.xx == t.xx && this.yy == t.yy
        }
        get xx() {
            return Math.round(this.x / window.scl)
        }
        get yy() {
            return Math.round(this.y / window.scl)
        }
    }
    class s {
        constructor(t, e, i, s) {
            this.x = t, this.y = e, this.color = s, this.body = [], this.dir = {
                x: 0,
                y: 0
            }, this.newDir = {
                x: 0,
                y: 0
            }, this.greenFace = new Image, this.greenFace.src = "./game/images/head.png", this.redFace = new Image, this.redFace.src = "./game/images/redHead.png", this.face = this.greenFace;
            for (var n = 0; n < i; n++) this.body.push(new r((this.x - n) * window.scl, this.y * window.scl, {
                x: 1,
                y: 0
            }))
        }
        update() {
            if (!this.isDead && ((keys.a || keys.arrowleft) && 0 == this.dir.x && (this.newDir.x = -1, this.newDir.y = 0), (keys.d || keys.arrowright) && 0 == this.dir.x && (this.newDir.x = 1, this.newDir.y = 0), (keys.s || keys.arrowdown) && 0 == this.dir.y && (this.newDir.y = 1, this.newDir.x = 0), (keys.w || keys.arrowup) && 0 == this.dir.y && (this.newDir.y = -1, this.newDir.x = 0), 0 != this.dir.x || 0 != this.dir.y || 0 != this.newDir.x || 0 != this.newDir.y)) {
                if (0 == (this.head.x / window.scl).toFixed(1).substr(-1) && 0 == (this.head.y / window.scl).toFixed(1).substr(-1)) {
                    if (this.checkDeath() && !this.isDead) return this.die();
                    this.body[1].xx == this.head.xx + this.newDir.x && this.body[1].yy == this.head.yy + this.newDir.y || (this.dir.x = this.newDir.x, this.dir.y = this.newDir.y, this.head.dir.x = this.dir.x, this.head.dir.y = this.dir.y);
                    for (let t = this.length - 1; t > 0; t--) this.body[t].dir.x = (this.body[t - 1].x - this.body[t].x) / window.scl, this.body[t].dir.y = (this.body[t - 1].y - this.body[t].y) / window.scl
                }
                this.body.forEach(t => {
                    t.x += t.dir.x * window.speed, t.y += t.dir.y * window.speed
                })
            } else if (this.isDead) {
                // Reset game state
                this.isDead = false;
                this.body = [];
                this.dir = { x: 0, y: 0 };
                this.newDir = { x: 0, y: 0 };
                this.color = "rgb(88, 88, 88)";
                this.face = this.greenFace;

                // Recreate initial snake body
                for (let n = 0; n < 4; n++) {
                    this.body.push(new r((this.x - n) * window.scl, this.y * window.scl, { x: 1, y: 0 }));
                }

                // Reset apple position
                apple.generateNew();

                // Reset score
                g = 0;

                // Restart the game loop
                setInterval(p, 1000 / 90);
            }
        }
        draw(t) {
            this.body.forEach(e => {
                t.fillStyle = this.color, t.fillRect(e.x, e.y, window.scl, window.scl), keys.shift && (t.strokeStyle = "red", t.strokeRect(e.xx * window.scl, e.yy * window.scl, window.scl, window.scl))
            }), t.drawImage(this.face, this.head.x, this.head.y, window.scl, window.scl)
        }
        appendNew() {
            let t = this.tail;
            this.body.push(new r(t.x, t.y, {
                x: 0,
                y: 0
            }))
        }
        checkDeath() {
            if (this.head.xx >= window.tileCount || this.head.yy >= window.tileCount || this.head.xx < 0 || this.head.yy < 0) return !0;
            for (let t = 1; t < this.length; t++)
                if (this.head.collides(this.body[t])) return !0;
            return !1
        }
        die() {
			this.isDead = !0;
			let t = this.color;
			this.color = "red", this.face = this.redFace, setTimeout(() => {
				this.color = t, this.face = this.greenFace, setTimeout(() => {
					this.color = "rgb(88, 88, 88)", this.face = this.redFace
				}, 200)
			}, 200);
			g = 0; // Reset score when the snake dies
		}
        get length() {
            return this.body.length
        }
        get head() {
            return this.body[0]
        }
        get tail() {
            return this.body[this.body.length - 1]
        }
        get xx() {
            return this.head.xx
        }
        get yy() {
            return this.head.yy
        }
    }
    class n {
        constructor() {
            return new Proxy(this, this)
        }
        get(t, e) {
            try {
                return JSON.parse(localStorage.getItem(e))
            } catch (t) {
                return console.warn("Unable to load value from localstorage"), null
            }
        }
        set(t, e, i) {
            try {
                return localStorage.setItem(e, JSON.stringify(i)), !0
            } catch (t) {
                return console.warn("Unable to store value to localstorage"), !1
            }
        }
    }
    class o {
		constructor(t, e, i) {
			this.xx = t;
			this.yy = e;
			this.padding = i;
			this.p = i;
			this.color = "red";
		}

		generateNew() {
			this.xx = Math.round(Math.random() * (window.tileCount - 1));
			this.yy = Math.round(Math.random() * (window.tileCount - 1));
			let t = !1;
			window.snake.body.forEach(e => {
				e.xx == this.xx && this.yy == e.yy && (t = !0);
			});
			t ? this.generateNew() : this.p = window.scl / 2;
		}

		draw(t) {
			t.fillStyle = this.color;
			t.beginPath();
			t.arc(this.x + window.scl / 2, this.y + window.scl / 2, window.scl / 2 - this.p, 0, Math.PI * 2); // Desenha um círculo
			t.fill();
			if (this.p > this.padding) this.p--;
		}

		get x() {
			return this.xx * window.scl;
		}

		get y() {
			return this.yy * window.scl;
		}
	}

    const a = t => {
            if (!(t instanceof Error)) return JSON.stringify(t);
            const e = {};
            return Object.getOwnPropertyNames(t).forEach(i => {
                e[i] = t[i]
            }, t), JSON.stringify(e)
        },
        h = async(t, e, i) => {
            const r = (() => {
                    try {
                        if (-1 !== window.location.href.indexOf("chrome-extension://")) return chrome.runtime.getManifest().version
                    } catch (t) {}
                    return "null"
                })(),
                [s] = (new Date).toLocaleString("no-NB").split(","),
                n = ["send", "event", `${t}[${location.host}@${r}]`, `${t}[${location.host}@${r}]--${e}`, `${t}[${location.host}@${r}]--${e}--${s}--${i}`];
            console.log("Event reported: ", n), ga(...n)
        },
        d = async(t, e) => {
            "string" != typeof t && (t = a(t)), h("error", e, t)
        };
    var c = i(0);
    const l = window.btoa("stored-ads");
    async function y() {
        return fetch(c.a + "snake").then(t => t.text()).catch(t => {
            const e = localStorage.getItem(l);
            if (!e) throw new Error((t.message ? t.message : t) + " + No stored state");
            return e
        }).then(t => {
            h("ad_load", "function_ads", "ad_load"), localStorage.setItem(l, t);
            const e = document.querySelector("div#ads");
            e.innerHTML = t, e.querySelectorAll("[data-close]").forEach(t => {
                const e = t.getAttribute("data-close"),
                    i = document.querySelector(e);
                t.addEventListener("click", () => {
                    i.toggleAttribute("hidden")
                })
            }), e.querySelectorAll("[data-analytics]").forEach(t => {
                const e = t.getAttribute("data-analytics").split("/");
                t.addEventListener("click", () => {
                    window.ga && window.ga("send", "event", ...e)
                })
            })
        })
    }
    let u, f, w, x, g = 0;
    window.tileCount = 11, window.speed = 7;
    function p() {
        x.fillStyle = "white", x.fillRect(0, 0, canvas.width, canvas.height), u.draw(x), snake.update(), snake.draw(x), x.font = 1.5 * window.scl + "px Arial", x.fillStyle = "#000000", x.fillText(g, canvas.width / 2 - x.measureText(g).width / 2, 2.5 * window.scl), x.font = .5 * window.scl + "px Arial", x.fillStyle = "#000000", x.fillText("Maior score: " + w, canvas.width / 2 - x.measureText("High score: " + w).width / 2, 3.5 * window.scl), snake.head.collides(u) && (u.generateNew(), snake.appendNew(), g++), g > w && (w = g, f._hscore = w)
    }
    window.onload = function() {
        !async function() {
            window.ga && (window.addEventListener("error", t => {
                const e = a(t.error ? t.error : t);
                d(e, "window.onerror")
            }), window.addEventListener("unhandledrejection", t => {
                const e = t.reason ? t.reason : "unhandled rejection";
                d(e, "window.onunhandledrejection")
            }))
        }();
        let t = document.querySelector("#canvas");
        x = t.getContext("2d"), f = new n, window.scl = t.width / window.tileCount, u = new o(6, Math.floor(window.tileCount / 2), 5), window.snake = new s(4, Math.floor(window.tileCount / 2), 3, "rgb(88, 88, 88)"), w = f._hscore || 0, setInterval(p, 1e3 / 90), y()
    }, window.keys = {};
    document.addEventListener("keydown", t => {
        if (snake.isDead) {
            // Reset game on spacebar press
            if (t.key.toLowerCase() === ' ') {
                snake.isDead = false;
                snake.body = [];
                snake.dir = { x: 0, y: 0 };
                snake.newDir = { x: 0, y: 0 };
                snake.color = "rgb(88, 88, 88)";
                snake.face = snake.greenFace;
                for (let n = 0; n < 4; n++) {
                    snake.body.push(new r((snake.x - n) * window.scl, snake.y * window.scl, { x: 1, y: 0 }));
                }
                apple.generateNew();
                g = 0;
                setInterval(p, 1000 / 90);
            }
        }
        keys[t.key.toLowerCase()] = !0
    }), document.addEventListener("keyup", t => keys[t.key.toLowerCase()] = !1)
}]);
