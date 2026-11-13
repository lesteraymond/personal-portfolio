(function () {
	"use strict";

	var btn = document.querySelector(".menu-btn");
	var nav = document.getElementById("site-nav");
	var links = Array.prototype.slice.call(nav.querySelectorAll("a"));

	function setMenu(open) {
		nav.classList.toggle("is-open", open);
		btn.setAttribute("aria-expanded", String(open));
	}
	btn.addEventListener("click", function () {
		setMenu(btn.getAttribute("aria-expanded") !== "true");
	});
	var locked = false;
	function unlock() {
		locked = false;
	}
	["wheel", "touchstart", "keydown"].forEach(function (t) {
		window.addEventListener(t, unlock, { passive: true });
	});
	links.forEach(function (a) {
		a.addEventListener("click", function () {
			setMenu(false);
			setCurrent(a.getAttribute("href").slice(1));
			locked = true;
		});
	});
	document.addEventListener("keydown", function (e) {
		if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
			setMenu(false);
			btn.focus();
		}
	});

	var sections = links
		.map(function (a) {
			return document.querySelector(a.getAttribute("href"));
		})
		.filter(Boolean);

	function setCurrent(id) {
		links.forEach(function (a) {
			if (a.getAttribute("href") === "#" + id) {
				a.setAttribute("aria-current", "true");
			} else {
				a.removeAttribute("aria-current");
			}
		});
	}

	if ("IntersectionObserver" in window) {
		var io = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting && !locked) setCurrent(entry.target.id);
				});
			},
			{ rootMargin: "-40% 0px -55% 0px" },
		);
		sections.forEach(function (s) {
			io.observe(s);
		});
	}
	setCurrent("home");

	document.querySelectorAll(".copy-btn").forEach(function (b) {
		b.addEventListener("click", function () {
			var text = b.getAttribute("data-copy");
			var status = b.parentNode.querySelector(".copy-status");
			var label = b.querySelector(".copy-label");
			function done(ok) {
				status.textContent = ok ? "Copied" : "Press Ctrl+C";
				label.textContent = ok ? "Copied" : "Ctrl+C";
				b.classList.toggle("is-copied", ok);
				setTimeout(function () {
					status.textContent = "";
					label.textContent = "Copy";
					b.classList.remove("is-copied");
				}, 2000);
			}
			if (navigator.clipboard && window.isSecureContext) {
				navigator.clipboard.writeText(text).then(
					function () {
						done(true);
					},
					function () {
						done(false);
					},
				);
			} else {
				var ta = document.createElement("textarea");
				ta.value = text;
				ta.style.position = "fixed";
				ta.style.opacity = "0";
				document.body.appendChild(ta);
				ta.select();
				var ok = false;
				try {
					ok = document.execCommand("copy");
				} catch (err) {
					ok = false;
				}
				document.body.removeChild(ta);
				done(ok);
			}
		});
	});

	var img = document.querySelector(".portrait img");
	if (img) {
		var fail = function () {
			img.parentNode.classList.add("is-missing");
		};
		img.addEventListener("error", fail);
		if (img.complete && img.naturalWidth === 0) fail();
	}
	var themeMeta = document.querySelector('meta[name="theme-color"]');
	var themeTimer;
	function toggleTheme() {
		var root = document.documentElement;
		var calm =
			window.matchMedia &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (!calm) {
			root.classList.add("theme-fade");
			clearTimeout(themeTimer);
			themeTimer = setTimeout(function () {
				root.classList.remove("theme-fade");
			}, 700);
		}
		var on = root.classList.toggle("theme-pink");
		if (themeMeta)
			themeMeta.setAttribute("content", on ? "#f2b3ca" : "#faf8f5");
	}
	var reduceMotion =
		window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	function rain() {
		if (reduceMotion) return;
		var colors = ["#e8556d", "#f27a93", "#f4b63f", "#ff9eb5"];
		for (var i = 0; i < 40; i++) {
			var h = document.createElement("span");
			h.className = "heart";
			h.setAttribute("aria-hidden", "true");
			h.textContent = "♥";
			h.style.left = Math.random() * 100 + "vw";
			h.style.fontSize = 14 + Math.random() * 26 + "px";
			h.style.color = colors[Math.floor(Math.random() * colors.length)];
			h.style.animationDuration = 3 + Math.random() * 3 + "s";
			h.style.animationDelay = Math.random() * 2 + "s";
			h.addEventListener("animationend", function () {
				this.remove();
			});
			document.body.appendChild(h);
		}
	}
	var bar = document.querySelector(".progress span");
	function updateProgress() {
		var max = document.documentElement.scrollHeight - window.innerHeight;
		bar.style.transform =
			"scaleX(" + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ")";
	}
	window.addEventListener("scroll", updateProgress, { passive: true });
	window.addEventListener("resize", updateProgress);
	updateProgress();

	var portrait = document.querySelector(".portrait");
	var mobile = window.matchMedia("(max-width: 800px)");
	if (portrait) {
		portrait.addEventListener("click", function () {
			if (mobile.matches) toggleTheme();
		});
	}

	document.querySelectorAll(".icons li, .stack img").forEach(function (el) {
		var timer;
		el.addEventListener("pointerdown", function (e) {
			if (e.pointerType === "mouse") return;
			el.classList.add("pop");
			clearTimeout(timer);
			timer = setTimeout(function () {
				el.classList.remove("pop");
			}, 900);
		});
	});

	/* Keep the scroll position when the page is refreshed */
	try {
		history.scrollRestoration = "manual";
		var navEntry = performance.getEntriesByType("navigation")[0];
		var saved = sessionStorage.getItem("scrollY");
		if (navEntry && navEntry.type === "reload" && saved !== null) {
			var back = function () {
				window.scrollTo({ top: Number(saved), behavior: "instant" });
			};
			window.addEventListener("load", function () {
				back();
				setTimeout(back, 300);
			});
		}
		var saving = false;
		window.addEventListener(
			"scroll",
			function () {
				if (saving) return;
				saving = true;
				requestAnimationFrame(function () {
					sessionStorage.setItem("scrollY", String(window.scrollY));
					saving = false;
				});
			},
			{ passive: true },
		);
	} catch (err) {}

	var toTop = document.querySelector(".to-top");
	function toggleTop() {
		toTop.classList.toggle("is-visible", window.scrollY > 600);
	}
	window.addEventListener("scroll", toggleTop, { passive: true });
	toggleTop();

	var codeA = [121, 97, 110, 110, 97];
	var codeB = [111, 108, 105, 118, 105, 97];
	var keys = [];
	function endsWith(list, tail) {
		if (list.length < tail.length) return false;
		for (var i = 0; i < tail.length; i++) {
			if (list[list.length - tail.length + i] !== tail[i]) return false;
		}
		return true;
	}
	document.addEventListener("keydown", function (e) {
		if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
		keys.push(e.key.toLowerCase().charCodeAt(0));
		if (keys.length > 6) keys.shift();
		if (endsWith(keys, codeA)) {
			keys = [];
			rain();
		} else if (endsWith(keys, codeB)) {
			keys = [];
			toggleTheme();
		}
	});
})();
