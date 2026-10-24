# Changelog

All notable changes to this project are documented here. The project follows
[Semantic Versioning](https://semver.org/). Each release is deployed to
[seriesoftub.es](https://seriesoftub.es).

## [Unreleased]

## [1.15.0] — 2026-10-25

- Integrated upstream 1.11–1.14: phone tab bar and draggable sheets, offline
  installation, refreshed icons, Italian, random network names, community IXs,
  and Barcelona, Manchester, Edinburgh, Bude and Stavanger with new cables.
- Added the Korean sender-pays market, a sixth Tier 1 for new games, regional
  optical-control failures, LACP trouble, partial packet loss and PMTUD faults.
- Adopted upstream long-haul optical modes and explicit regeneration sites,
  preserving full-rate channels in existing saves. Scenic routing is stable.
- Retained power, automatic maintenance, hosting/scrubbing, scalable caches,
  service switches, customer growth, warnings and proprietary submarine cables.


## [1.14.0] — 2026-10-24

- More of Britain and Norway: Manchester, Edinburgh, the cable town of Bude
  in Cornwall, and Stavanger, with British and Norwegian eyeball networks
  (Bee-Tee, Sky-High Broadband, Virgin Mediocre, Tele-Nor-Way).
- Nine new cables: NO-UK-Way across the North Sea (with dark fiber for
  sale), Celtic Norsemen from Ireland to Norway, Havhingsten Hoofbeat from
  Blackpool to Denmark, the Shefa Sheep Line to Iceland via the Faroes, Oil
  Rig Wi-Fi from Stavanger to the Netherlands, Pas de Câble under the
  Channel, and Apollo 13, Yellow Brick Road and Glo-in-the-Dark into Bude.

## [1.13.2] — 2026-10-24

- On phones, the "new version is out" notice is a small card above the tab
  bar again instead of filling the whole screen.

## [1.13.1] — 2026-10-24

- New home-screen icons. On iPhone and on Android's round and squircle
  icons, the tube now sits on a full sky-blue background instead of a frame
  inside a frame.

## [1.13.0] — 2026-10-24

- Made for phones. A one-row status strip at the top, a tab bar at the
  bottom (play, speed, goals, deals, NOC, networks), and bottom sheets you
  drag up, down or away; on a phone held sideways they slide in from the
  side. Notifications tap away, dialogs open as sheets, and the start button
  stays in reach.
- Install it like an app: Series of Tubes now works offline and can be added
  to your home screen on Android and iOS (look for "Install" on the title
  screen or in Settings). It opens full screen and still updates itself.

## [1.12.0] — 2026-10-24

- Korea's "sender pays" market. Transit into Seoul costs four times the
  usual price, and the three incumbents, Kay-Tea, SK Broadbandit and LG
  You-Pay-Plus, only peer over paid PNIs billed per gigabit you send them.
  Glitch may quit Korea over the fees, Faceplant may quietly reroute Korean
  users via Hong Kong, and the new Gangnam Style Peering scenario starts you
  in Seoul. Collect all three PNIs for the Sender Pays badge.
- Sparkly Seabone is a Tier 1 now (#23), with a backbone across the
  Mediterranean, Europe and the Americas. New games need a PNI with all six
  Tier 1s to go transit-free; saves from before this release keep the five.
- Optical control plane meltdown: one bad update at your wave supplier, and
  every wave you lease from it in a region goes dark at once. Your own dark
  fiber carries on.
- New ways for things to go subtly wrong: LACP trouble (hash polarisation,
  timer mismatches, a member in the wrong switch, min-links set a little too
  keen), partial packet loss from dirty connectors, CRC errors and
  microbursts (deep-buffer routers shrug those off), and PMTUD black holes
  where pages to one network load halfway and stop.
- The top bar fits itself to the screen in every language: when labels get
  long, the less important readouts step aside instead of wrapping over the
  side panels.

- Series of Tubes now speaks Italian. The game follows your browser's
  language the first time, and you can switch between English and Italian
  under Settings or on the title screen; the choice is remembered (#26, thanks @daniloctdev).
- Want the real thing? The title screen, the help page and the victory screen
  now point to How the Internet Works by Thomas Kjær Aabo, an interactive,
  zoomable guide to how your packets actually travel.

## [1.11.0] — 2026-10-24

- Very long dark fiber works now (#17, #30). Optics drop to a slower, longer-
  reaching setting past their full-rate reach: the 1.6T transponder runs at
  800G to 7,000 km and 400G to 12,000 km, and ZR+ optics halve their speed
  to double their reach. Regeneration sites go further: each one turns the
  light back into bits and sends it on fresh, so optics only have to reach
  the next site. Existing long fibers light up without changes.
- "Quietest links" routing no longer flips between two paths every day. It
  judges how busy a link is without the customer's own traffic, splits the
  circuit over two paths that are about as quiet, and keeps yesterday's
  choice unless a new one is clearly better (#28).
- Fewer "-ish" names. Conferences and the RIPE NCC use their real names,
  data centers are named after their streets and districts, and cables,
  carriers and routers got proper puns instead (Concerto in Sea Minor,
  Circe du Soleil, Strait Outta Taipei, Jeddah-i Express, Kyiv Superstar,
  Du-opoly and friends).
- Customers who are afraid of sharks only ask for routes that can stay on
  land. No more Americas-to-Eurasia requests without a subsea cable, and
  impossible asks in existing saves are dropped (#16).
- The game no longer freezes when a peer drops you at a rival exchange
  (#24, thanks @daniloctdev), or when a route leak melts down one. The
  messages now name the exchange and its city.
- One failing day no longer freezes the whole game: the error is caught,
  you get a heads-up, and time keeps running.
- Barcelona joins the map with Catnip-IX, local transit and peering, and the
  Medusa Stare cable along the coast to Lisbon and Marseille (#18, thanks
  @NickBouwhuis).
- Community exchanges: FRIES-IX, Paella-NIX, KleyWrecks, LO-NAPS, JINXED-IX,
  IX Strayla and Bento-IX have their own, smaller member lists and cheaper
  ports. FRIES-IX 10G and 100G ports and LAG members are free.
- New networks get a random name, from Shinternet to Bogon Voyage. Click
  "Another one" for more questionable branding, or type your own (#27,
  thanks @NickBouwhuis).

## [1.10.0] — 2026-10-24

- Router ports are finite. Every transit, IX, PNI and cache port, every wave
  and every fibre channel takes a router port; 10G ports ride a breakout,
  four to a port. The Infra tab shows how many are left, and plugging in more
  than you have is refused.
- More routers: up to six per POP, and six new models to swap in from the
  Infra tab: Mikrowtik CCR-ish, Sonic the Whitebox 32 (cheap, crashes more),
  Arrrhipster 7280R-ish and 7800R-ish (lots of ports, deep buffers, boots in
  minutes), Disco 8K-ish (licence keys for everything) and Knockia 7750-ish.
  A swap that would not fit what is already plugged in is refused.
- New cities: Milan, Rome, Palermo, Lisbon and Athens in Europe; Atlanta,
  Denver, Phoenix, Boston, Houston and Salt Lake City in the US. New cables
  land with them (Lisbon to Brazil, Africa and the US Southeast; Genoa to
  Sicily and Athens; Palermo to Marseille and Alexandria; Athens to Istanbul;
  Boston to Dublin), along with local networks to peer with.
- Rival exchanges: 25 big metros now have a second (sometimes third) IX.
  Challengers are cheaper and share many members with the incumbent, but not
  all of them. Each IX is its own port, LAG and route server.
- The long tail: 60 small, odd networks with a sliver of traffic each, spread
  over random exchanges. "Request all willing peers" signs them up in one go,
  and they fold into one row in the network lists.
- Europe's peering market is competitive: IX ports there cost 20% less, and
  price wars between rival exchanges cut your port bill further. DE-KICKS
  responds with a webinar.
- Voda-Phony has ended settlement-free peering. It now peers only over a paid
  PNI, through its interconnection partner.
- New US eyeballs Spectre-um Cable and Very-Zone (paid peering only).
- Pausing now freezes the map too: packet dots, waves and clouds stop
  moving until you press play again (#11).
- Ports in both buildings: with a second site, any transit port, PNI or IX
  port can now be set to "Both". That splits it into a LAG with members in
  each building (adding a member if needed), so a dark building only takes
  out half the port instead of all of it (#8).
- The top bar no longer wraps onto a second row and covers the side panels
  on laptop-sized screens.
- Routers make sense now: the Chonk 800 takes 800G waves and ports (a new
  800G wave sits between 400G and 1.6T), and only the Absolute Unit has 1.6T
  ports and takes 6.4T waves, handed off as 4×1.6T. Existing waves keep
  their size.
- London–Amsterdam is everywhere: three more cheap North Sea cables, and dark
  fiber you can lease on them (and on the Channel), since you can't dig under
  the sea.
- Your own IX can grow (#10): upgrade its fabric from 400G to 1.6T, 6.4T and
  25.6T. Bigger fabrics carry more and have room for more members.
- Wave prices follow real markets: Europe is cheap, North America average,
  Asia and South America pricier, and anything into Africa several times the
  price. Every route has its own going rate, and new leases get about 8%
  cheaper each year. The link planner tells you how a route compares.
- Cairo–Dubai over the Red Sea, plus I-ME-WE-Us to Fujairah and Mumbai.
- The Gulf: Jeddah, Riyadh and Doha. Saudi POPs need a local telecom licence,
  gigaprojects want enormous demo networks, and now and then the neighbours
  fall out and every link between Qatar and Saudi Arabia or the UAE goes dark
  for months. Qatar is on the map as a peninsula now, too.
- Tablets in landscape: slimmer side panels, bigger touch targets, and the
  left panel tucks away while a city is open (tap "Goals & NOC" to bring it
  back).

## [1.9.0] — 2026-10-23

- RouteScript: program your Auto-TE controller from the NOC tab with a tiny
  rule language: `spill at 80%`, `prefer pni for goggle`, `avoid transit for
  netchill`, `cap transit cogentle at 20 gbps`, `drain paris`, `avoid link
  fra-ams` and `blackhole ddos`. Check runs a dry run against live traffic
  and shows what would change; Deploy makes it real. Typos get a "did you
  mean". Two new badges: Script Kiddie and Fat Finger.
- Zoom in twice as far as before, handy for crowded spots like the UAE,
  Singapore or Central Europe.
- Half speed: a new ½× button, or press 0.
- NOC dashboard: a legend explains the colours in "How it arrives", the
  network table sorts by any column (traffic, transit cost, loss, name), and a
  new "Who your transit carries" list shows the networks you pay transit to
  reach, with the cheapest way to move each one to peering (#7).
- The Transit tab shows the top destinations on each transit port, with the
  same hint, so you can see who to peer with in that city (#7).
- A full code review, and about 40 fixes from it:
  - Saves and imported files are checked and repaired before use, so a
    damaged or hand-edited save can no longer break the game or inject
    anything into the page.
  - Loophole fixes: flipping crypto loans for profit, free repairs of
    geopolitical cable cuts, re-rolling DE-KICKS quotes, walking out of a
    failing event, and selling the same trench twice.
  - The Red Sea scenario really cuts the Red Sea now, the weekly challenge
    gives everyone the same world, and its "pricey" and "poor" twists work.
  - China Telecomet and China Unicorn no longer act like Tier 1s.
  - Metro ring cuts now alert you, overlapping site outages no longer cancel
    each other, and alien waves work on unlit fiber.
  - Routing is several times faster on big networks.
  - The map fills wide screens at any zoom, pinch zoom goes as far as the
    mouse wheel, and touch scrolling and cancelled touches behave.
  - Starting a scenario from a running game asks first, and Space no longer
    pauses when you meant to press a button.
- Settings for animations and sound, in the menu and on the help screen.
  Animations can follow your device's reduce-motion setting (the default),
  or be forced on or off. Off freezes the map: no moving packets, pulses or
  floating text.

## [1.8.0] — 2026-10-23

- Traceroute and looking glass: tap 🔍 Traceroute on any of your cities, or
  open it from the NOC tab. See the exact path to any network or POP, hop by
  hop, with latency, the exit it leaves through and the AS path, plus why
  that exit won.
- Share card: an image of your network with a mini map, your stats and your
  rarest badges, ready to post. Find it in the menu, after winning and after
  a scenario.
- Scenarios: six hand-built challenges with a goal and a deadline (Only
  Spätzle-IX, Red Sea Crisis, The Cogentle Spat, Carnaval, Mind the Gap and
  Anchors Away), plus a weekly challenge where everyone gets the same world,
  the same start city and the same two twists for a week.
- Sandbox mode: a billion dollars, every unlock and nothing ever breaks.
  No badges, though.
- Conference season: NANOG-ish, RIPE-ish, DENOG-ish, APRICOT-ish and more
  come round every year. Register in the Deals tab and selective networks in
  that region need half the usual traffic to peer with you for 45 days.
- A guided first game for new players, step by step, with a skip button.
- Kyiv, with Varenyky-IX and KyivStar-ish. Blackouts are frequent, so bring
  a generator. Nobody sells capacity between Kyiv and Moscow.
- 7 more badges for scenarios, the weekly challenge and conferences.

## [1.7.0] — 2026-10-23

- Auto-TE: from customer level 3 you can install a traffic-engineering
  controller in the NOC tab. When the shortest path is full, the overflow
  spills onto up to two alternate paths with free capacity instead of being
  dropped. Without it, traffic still reroutes around failures, but a full
  link stays full, just like a real IGP.
- 16 more badges, mostly rare, epic and legendary: Traffic Whisperer, Same
  Street, Anchors Aweigh, Samba Peering, DE-KICKS Bingo, Ring of Fire, Iron
  Curtain Call, Island Hopper, Through the Wall, Darwin Award, Unbreakable,
  Gigawatt Landlord, Blitz, Hundred Terabits and a few more, one of them
  secret. That makes 46.

## [1.6.0] — 2026-10-23

- South America is on the map properly: Fortaleza, Rio de Janeiro, Buenos
  Aires, Santiago, Lima, Bogotá and Panama City, with new cables including a
  ring round Cape Horn, a direct São Paulo–New York cable and the first
  cable from Chile to Sydney. Nothing crosses the Darién Gap by land, transit
  is pricier because so much traffic hairpins through Miami, and fiber over
  the Andes costs double and breaks often. IX.brrr is run by a nonprofit
  with cheap public prices, and small Brazilian provedores now buy transit
  from you.
- More India: Delhi, Chennai, Bengaluru and Hyderabad, with east-coast cables
  to Singapore and a lot of road widening.
- Taiwan: Taipei, with cables to Tokyo, Hong Kong, Los Angeles, Seattle and
  Shanghai, and ships that keep dragging their anchors over them.
- The UAE: Abu Dhabi and Fujairah join Dubai. Only the licensed duopoly may
  run fiber inside the country, so there is no dark fiber, waves cost 3×, and
  POPs need a free-zone license. Most cables land in Fujairah.
- Cape Town, with Atlantic cables up the west coast of Africa and load
  shedding: bring a generator.
- New local networks: Clarovision, Vivo-ish, Mercado Livre-ly, Jio-graphy,
  Airtel-tale, Chunghwa Tele-calm and do-ish.
- Metro diversity: add a second data center in any POP's metro from the
  Infra tab, joined by your own metro ring. A power cut, cleaner or A/C
  failure then only takes out half the city. You choose which site each
  transit, PNI and IX port plugs into, and metro ring cuts can cut site B
  off. Some hyperscaler and AI customers now insist on two sites.
- More Asia-Pacific: Melbourne, Brisbane, Darwin, Osaka, Kuala Lumpur,
  Bangkok, Ho Chi Minh City, Karachi, Dhaka and Colombo, with cables to match.
  Vietnam's cables break a lot, and Darwin has crocodiles.
- Central and Eastern Europe: Warsaw, Prague, Vienna, Budapest, Bucharest,
  Tallinn and Istanbul. Baltic cables meet a lot of anchors.
- The giants: at customer levels 3 and 4, hyperscalers and AI clouds bring
  deals only they would ask for. Terabit AI WANs between gigawatt campuses,
  training runs spread over three or four sites, week-long dataset ingests,
  and hundreds of fiber pairs in a trench you dug yourself. Their campuses,
  from Star-Gait Abilene to the Johor-ish Overflow, show up in each city's
  "Who's here".
- Dark fiber pairs you lease out now earn even before you light your own
  channels on that fiber.
- More local networks: KD-DIY, Opt-Out-Us, Mostly-True Move, Viet-tell,
  PTC-hell, Telekom Ma-lazy-sia, Türk Tele-komik, Digi-tally Cheap and
  UPC-You-Later.
- Badges: 30 achievements from common to legendary, shown under your goals.
  Some take luck (Shark Bait), some take years (Five Nines, Speedrun), and a
  couple are secret. Badges from earlier games stay on this device in a hall
  of fame.
- Five new goals between Tier 2 and Tier 1: light your own dark fiber, be in
  two buildings at once, five continents, sign a giant, and serve 10 Tbps.
- Tap your network's name in the top left for a menu to export or import a
  save, or start a new network.

## [1.5.0] — 2026-10-23

- Several transits in the same city now share the load instead of filling one
  after the other. The same goes for any exits that are equally close: traffic
  is spread by free capacity, and local exits still win over far ones (#4).
- Export your save to a file and import it on another device, from the help
  screen or the title screen (#5).
- Full transit ports, IX ports, PNIs, caches and routers are now easy to spot.
  They get red badges on the map (T, P, C, R), the IX hexagon blinks red when
  its port is full, and the NOC lists everything running hot with a hint on
  what to do (#6).
- Some routers take forever to boot. The Infra tab shows each chassis's boot
  time and its forwarding chip, including the Junipurr PacketOinker™ in the
  Chonk 800 and two of them in the Absolute Unit. On a slow booter, crashes
  last a few days longer, a rush repair still needs a day of booting, and
  swapping the only router takes three days. Bigger chassis are slow more
  often. A second router hides all of it.

## [1.4.0] — 2026-10-23

- Big peers have moods now. In some cities, large selective networks refuse
  new peering for a few months, or only take PNIs there, each with a reason
  ("the peering coordinator is on sabbatical", "a new VP wants to monetise
  interconnection"). Now and then they also tear down a session you already
  had, and traffic falls back to your next best path. Try another city or a
  PNI, and ask again later.
- Remote peering is still on offer, but it is now a last resort. Ports come
  through a reseller at 1.5× the price and only 80% of the port is really
  yours. Goggle, Faceplant, Comecast and several other selective networks
  refuse remote members outright. The route server still gets you every open
  network, and building a real POP removes all of this.
- DE-KICKS Group (Frankfurt, Madrid, Marseille, Dubai, Mumbai and New York)
  really hates open pricing. There is no price list, only a personalised
  quote that grows with how big you look. Haggling can get you a discount,
  raise the price "after consulting with management", or stall for a week
  behind an NDA. Prices are "harmonised" upwards once a year. Add-ons like
  Route Server Gold and Premium Port LEDs appear on your invoice until you opt
  out, which takes two clicks. Trying to leave gets you a retention discount
  that ends with a loyalty fee.

## [1.3.0] — 2026-10-23

- Event networks: festivals, trade fairs and big games book a fat temporary
  pipe in a city weeks ahead. Nothing is paid up front; deliver the bandwidth
  for the whole event and you get the full fee, fall short and the organisers
  pay less, fail badly and you pay them.
- SD-WAN for chains: kebab empires, coffee franchises and furniture giants
  want every shop wired back to their head office. Each site needs a path to
  the hub, and one dead spoke takes the whole contract down until it is fixed.
- Wholesale waves: once you light your own dark fiber, other carriers ask to
  rent spare spectrum on it as alien waves. Every slot you sell is one fewer
  channel for you.
- Dark fiber pair leases: fiber you built yourself can be leased out pair by
  pair to others for steady monthly money.

## [1.2.0] — 2026-10-23

- A bank: tap your cash to open it. Lenders (Goldman Sacks, Deutsche Bankrupt,
  Spätzle-Sparkasse, the Ministry of Tubes, Crypto Bros Capital, Venture
  Vultures, the Loan Shark and more) make offers with odd conditions. Offers
  come faster when you are in the red, so a bad hour no longer has to end in
  bankruptcy. Credit ratings, penalties for broken conditions, early repayment.
- Your game now saves every few seconds and whenever you leave the page, and a
  reload drops you straight back into your network.
- Release announcements: a "What's new" card after an update, and a banner with
  a one-click reload when a new version comes out while you are playing.
- Start a new network any time from the help screen.

## [1.1.0] — 2026-10-23

- Stuttgart, home of the Spätzle-IX.

## [1.0.0] — 2026-10-23

First public release.

- Cartoon world map with real-ish geography, magnified Europe and East Asia,
  about 50 cities and around 40 named subsea cable systems.
- POPs, home broadband, business customers with escalating customer levels
  (up to AI training interconnects and hyperscaler DCI) and quirky requirements.
- IP transit on 95th-percentile billing, IXs with route servers, peering
  policies, PNIs, embedded caches, NNI fabrics and remote peering.
- Leased waves, parallel links in shared or diverse trenches, dark fiber
  (lease or build) with DWDM line systems, amplifiers and ZR+/transponder optics.
- Router generations from 100G to 1.6T ports, extra routers and generators for
  redundancy.
- LAGs: bundle up to 8 identical ports to the same transit provider, IX or PNI.
- Traffic engineering: per-link traffic breakdown, link metrics, egress
  preferences, latency-aware and scenic routing.
- Mainland China (licenses, the Great Firewall, premium routes via Hong Kong),
  Russia (government boxes, throttling, sovereign internet drills) and an
  underserved Asian market.
- Dozens of failure types and geopolitical events, a NOC with an event log, and
  a NOC dashboard with traffic, money and per-ASN graphs.
- Cookieless Ridiculytics analytics on the live site only.


## Earlier fork releases

### [1.14.0] — 2026-10-24

- Optional service-switch banks aggregate cache boxes and hosting rack handoffs.
  Three models provide 48, 96 or 256 access ports per bank. Only uplinks use
  router ports; a shared service traffic budget limits actual throughput.
  Existing saves retain direct attachment until switches are installed.
- Expand banks, upgrade access and uplink speeds, or bundle up to 64 uplinks
  per chassis. Every purchase previews capacity, port needs and recurring
  costs. Switches and uplinks add power and operating costs.
- Pair each bank for redundant attachment. Access slots are not double-sold;
  both chassis contribute uplink bandwidth. Automatic maintenance rolls one
  chassis at a time. Failures are replaced automatically, and separate POP
  sites protect paired members from a local building outage. Spare uplink
  capacity is still needed when a member is offline.
- Hosting and Infra show a POP capacity overview. The NOC compares service
  access ports and actual uplink use, flags busy service uplinks, and includes
  them in the configurable 100% circuit-load pause.


### [1.13.0] — 2026-10-24

- Tier 1 networks can build proprietary submarine cables along surveyed sea
  corridors. Pay for construction, ROADMs and wet repeaters, wait for laying,
  then install up to 64 independent 400G wet-plant channels. No wave rent;
  upkeep, failures, regional risks and landing permits still apply. Sandbox
  also unlocks cable construction.
- Terrestrial dark fiber extends beyond 4,000 km using level-4 ROADMs and
  per-channel optical regeneration. Extra hardware and monthly site costs
  scale with the number of spans rather than imposing a fixed distance cap.
- Completed the Italian routes requested in upstream #21: Rome to Milan via
  Genoa, Palermo and Marseille; Palermo joins the FEA-ish and SEE-ME-WAVE 4-ish
  corridors. Milan has RisottIX and Rome has CarbonarIX.
- City-panel tabs wrap within the drawer on laptops and tablets, keeping
  Hosting visible without overflowing the panel.


### [1.12.0] — 2026-10-24

- Caches grow beyond four boxes. Add one or ten at a time, or upgrade the
  interfaces from 100G to 400G and 1.6T. Boxes share a scalable pool instead
  of creating thousands of routing exits. Router ports, service fees and
  metered electricity still matter; overflow uses peering or transit.
- Full circuits pause the game at 100% load, with an Inspect shortcut. Resume
  without repeated interruptions: a circuit re-arms only below 90% load.
  Disable this independently of customer warnings in Settings.
- Customers can request bandwidth expansions with 30 days' notice. Accept to
  schedule the extra capacity and revenue, or keep the current contract.
  Nothing changes automatically; accepted expansions get 15 days of grace.
- Tablet double taps no longer trigger default page zoom. Pinch zoom still
  works, lifting one finger resumes panning, and the menu can reset the map.
- Ten new hubs fill gaps: Vancouver, Winnipeg, Casablanca, Dakar, Accra,
  Luanda, Dar es Salaam, Tashkent, Almaty and Hanoi. They include transit,
  local peering, fabric access and three game-world coastal cable systems.
- Endgame room: a 204.8T modular router, up to 64 routers and LAG members,
  256 racks per POP, 1.6T fabrics and virtual circuits, and 409.6T own IXs.
  Parallel waves and fiber remain available for further backbone growth.
- Fixed North American power tariffs using the wrong region key, invalid NNI
  and circuit data breaking imported saves, and phantom router capacity
  when no router remained available.


### [1.11.0] — 2026-10-24

- Power is a real operating cost now. Routers, caches, optical gear and
  servers draw power, cooling adds 35%, and each city has its own tariff.
  Check the Power & cooling section in Infra or compare POPs in the NOC.
- UPS batteries bridge one game day, generators burn diesel while the grid
  is down, and an independent second feed protects against local faults.
  Regional blackouts can take both feeds down. Batteries must recharge.
- Maintenance happens automatically. The NOC gives seven days' notice;
  redundant routers are serviced and swapped one at a time without customer
  impact. A single router goes down for a day. Generator and server service
  is automatic too, and optical channels periodically need maintenance.
- A full NOC event log remembers the latest 300 entries, including recovery,
  maintenance and customer changes. Filter by category or search by city.
- Open server rooms: buy 20U racks, rent units to colocation tenants, or
  install your own web, cloud and DDoS scrubbing servers. New customers arrive
  weekly when service is healthy. Hosting brings traffic, power bills,
  operating costs, revenue and satisfaction; poor service causes churn.
- Scrubbing is capacity-limited and depends on power and a live backbone
  path. Existing centers remain 400G appliances; extra servers add 100G each,
  limited by the POP's forwarding capacity. Attacks above capacity still hurt.
- Existing saves get sensible defaults and a fresh maintenance schedule.


### [1.10.1] — 2026-10-24

- Your customers have a dashboard now: every contract, satisfaction, revenue,
  service problem and requirement, sortable and one click away from its city (#14).
- Satisfaction stays in the top bar, warns before customers are furious, and
  pauses the game when they become furious. Turn auto-pause off in Settings (#13, #15).
- Find PNI meet-me rooms from transit destinations and the NOC, including cities
  you have not built in yet and the reason a network will not peer with you (#12).
- Parallel waves on one cable segment share a map line and a combined capacity
  label. Open the line to inspect and manage each wave separately (#19).
- Local breakout accepts PNIs too (#20). Shark-averse customers no longer ask
  for land paths across oceans (#16). Dark fiber orders beyond the reach of
  every available optic are refused before you pay for the trench (#17).
- Rival IX outages and de-peering notices no longer mistake exchange IDs for
  cities. Auto-pause stops the remaining days in a fast simulation frame.
- Updated from upstream 1.10.0 and published for tubes.krieger.pm.
