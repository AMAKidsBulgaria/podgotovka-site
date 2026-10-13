/* Речник дума → картинка за Букварика (собствени картинки: Kenney CC0 спрайтове и наши SVG икони). */
(function () {
  const P = (w, img) => ({ w, img });           // растерна картинка от assets/img
  const S = (w, sym) => ({ w, sym });           // SVG символ от index.html
  window.BUK_WORDS = [
    P("ябълка", "obj/apple.png"), P("банан", "obj/banana.png"), P("морков", "obj/carrot.png"), P("череши", "obj/cherries.png"),
    P("кокос", "obj/coconut.png"), P("бисквита", "obj/cookie.png"), P("царевица", "obj/corn.png"), P("кексче", "obj/cupcake.png"),
    P("поничка", "obj/donut-sprinkles.png"), P("грозде", "obj/grapes.png"), P("сладолед", "obj/ice-cream-cne.png"), P("лимон", "obj/lemon.png"),
    P("гъба", "obj/mushroom.png"), P("портокал", "obj/orange.png"), P("круша", "obj/pear.png"), P("ананас", "obj/pineapple.png"),
    P("тиква", "obj/pumpkin.png"), P("ягода", "obj/strawberry.png"), P("домат", "obj/tomato.png"), P("диня", "obj/watermelon.png"),
    P("риба", "fish_orange.png"), P("камък", "rock_a.png"), P("водорасли", "seaweed_green_a.png"),
    S("замък", "castle"), S("кораб", "ship"), S("облак", "cloud"), S("къща", "house-2"), S("чудовище", "mo-1"), S("звънец", "icon-bell"), S("слушалки", "icon-headphones"),
    S("елха", "pic-elha"), S("жаба", "pic-jaba"), S("звезда", "pic-zvezda"), S("игла", "pic-igla"), S("йогурт", "pic-jogurt"), S("ножица", "pic-nojica"),
    S("очила", "pic-ochila"), S("ухо", "pic-uho"), S("флаг", "pic-flag"), S("хвърчило", "pic-hvarchilo"), S("шапка", "pic-shapka"), S("щипка", "pic-shtipka"), S("юмрук", "pic-jumruk"),
    S("нос", "pic-nos"), S("ключ", "pic-kliuch"), S("самолет", "pic-samolet"), S("топка", "pic-topka"), S("врата", "pic-vrata"), S("зъб", "pic-zab"), S("око", "pic-oko"), S("усмивка", "pic-usmivka")
  ];
  window.BUK_PIC = item => item.img ? `<img src="assets/img/${item.img}" alt="" draggable="false">` : `<svg viewBox="0 0 100 100" aria-hidden="true"><use href="#${item.sym}"/></svg>`;
})();
