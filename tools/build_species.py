"""Write the species table into web/lib/data.ts.

The care profiles are hand-authored and kept here as one table so the whole
set can be read and corrected in one place. Watering intervals are a starting
point that the weather then moves. Advice is written as something to look at
rather than a number to hit, and every feeding and pest line says to use the
least that works.

    python tools/build_species.py
"""

import pathlib

# id, name, latin, also-known-as, group, waterEvery, fertiliseEvery, advice, feedWith, pestWatch
ROWS = [
    # Trees
    ("neem", "Neem", "Azadirachta indica", "nim limbdo", "Trees", 3, 45,
     "Water when the soil is dry two inches down.",
     "A handful of compost worked into the top inch. Neem asks for very little.",
     "Look under the leaves for scale and mealybug. Wipe them off with soapy water before you reach for anything stronger."),
    ("peepal", "Peepal", "Ficus religiosa", "pipal bodhi ashwattha", "Trees", 4, 60,
     "Keep it damp while it is young, never waterlogged.",
     "Compost twice a year. Young ones take a spoon of vermicompost.",
     "Leaf-eating caterpillars in the monsoon. Pick them off by hand, they are large and few."),
    ("banyan", "Banyan", "Ficus benghalensis", "bargad vat", "Trees", 4, 60,
     "Water around the drip line, not against the trunk.",
     "Compost at the drip line once a season.",
     "Mostly untroubled. Check aerial roots for borer holes."),
    ("mango", "Mango", "Mangifera indica", "aam", "Trees", 5, 40,
     "Deep soak rather than a daily splash.",
     "Well-rotted manure at the drip line, never against the trunk.",
     "Hoppers and powdery mildew before flowering. Neem oil spray at dusk, not in the sun."),
    ("jamun", "Jamun", "Syzygium cumini", "black plum java plum", "Trees", 4, 50,
     "Steady moisture through the first two summers.",
     "Manure before the rains, once a year.",
     "Fruit flies and leaf spot. Clear fallen fruit rather than spraying."),
    ("gulmohar", "Gulmohar", "Delonix regia", "flame tree royal poinciana", "Trees", 4, 50,
     "Let the top of the soil dry between waterings.",
     "A light compost dressing before the rains.",
     "Defoliating caterpillars after the first rain. Hand-pick, they pass in a fortnight."),
    ("ashoka", "Ashoka", "Saraca asoca", "sita ashok", "Trees", 3, 45,
     "Shade-tolerant, but thirsty while it establishes.",
     "Compost twice a year while it establishes.",
     "Leaf webber and scale. Prune the affected shoots out."),
    ("amla", "Amla", "Phyllanthus emblica", "indian gooseberry aonla", "Trees", 5, 50,
     "Deep water weekly in summer, less once it fruits.",
     "Manure at the start of the rains.",
     "Rust and bark-eating caterpillar. Scrape the webbing off the trunk."),
    ("guava", "Guava", "Psidium guajava", "amrood peru", "Trees", 4, 35,
     "Even moisture while fruiting, drier after.",
     "Compost every month or two through the growing season.",
     "Fruit fly is the main one. Bag the fruit or hang traps."),
    ("lemon", "Lemon", "Citrus limon", "nimbu citrus lime", "Trees", 3, 30,
     "Never let it dry out fully, never let it sit wet.",
     "Citrus feed or compost plus wood ash, little and often.",
     "Leaf miner and citrus butterfly. Pick the caterpillars off, they are easy to see."),
    ("pomegranate", "Pomegranate", "Punica granatum", "anar", "Trees", 5, 40,
     "Let it dry a little between waterings.",
     "Manure once before flowering.",
     "Fruit borer. Bag the fruit early."),
    ("papaya", "Papaya", "Carica papaya", "papita", "Trees", 3, 30,
     "Frequent light water. It hates standing water at the collar.",
     "Compost monthly, it grows fast and eats.",
     "Mealybug and ringspot virus. Remove badly affected plants rather than treating."),
    ("drumstick", "Drumstick", "Moringa oleifera", "moringa sahjan saijan", "Trees", 6, 60,
     "Very drought tolerant. Water deeply but rarely.",
     "Almost nothing. A little compost once a year.",
     "Hairy caterpillars in the monsoon. Hand-pick."),
    ("curry-leaf", "Curry leaf", "Murraya koenigii", "kadi patta meetha neem", "Trees", 3, 35,
     "It likes sun and dislikes sitting in water.",
     "Compost plus a spoon of curd water once a month, the old way.",
     "Citrus butterfly caterpillars and psyllids. Pick the caterpillars off, they are easy to see."),
    ("coconut", "Coconut", "Cocos nucifera", "nariyal", "Trees", 4, 60,
     "Deep water, and salt in the basin once a year.",
     "Manure and a handful of salt in the basin annually.",
     "Rhinoceros beetle. Keep the crown clean of rotting matter."),
    ("banana", "Banana", "Musa acuminata", "kela", "Trees", 2, 25,
     "Thirsty. Water often, drain well.",
     "Heavy feeder: compost every three weeks.",
     "Sigatoka leaf spot. Cut off affected leaves and burn them."),
    ("arjuna", "Arjuna", "Terminalia arjuna", "arjun kahua", "Trees", 5, 60,
     "Water weekly until established, then rarely.",
     "Compost once a year before the rains.",
     "Largely untroubled once established."),
    ("bamboo", "Bamboo", "Bambusa vulgaris", "baans", "Trees", 3, 40,
     "Keep the root zone moist through summer.",
     "Compost twice a year.",
     "Bamboo mites on the undersides. Hose them off."),
    ("tamarind", "Tamarind", "Tamarindus indica", "imli", "Trees", 6, 60,
     "Deep and infrequent. It handles drought well.",
     "Manure once a year.",
     "Mealybug on young shoots."),
    ("jackfruit", "Jackfruit", "Artocarpus heterophyllus", "kathal", "Trees", 4, 45,
     "Steady moisture, never waterlogged.",
     "Manure twice a year.",
     "Fruit borer and rot. Remove fallen fruit."),
    ("custard-apple", "Custard apple", "Annona squamosa", "sitaphal sharifa", "Trees", 5, 45,
     "A dry spell before flowering helps it set.",
     "Compost before the rains.",
     "Mealybug in the fruit crevices."),
    ("chikoo", "Chikoo", "Manilkara zapota", "sapota sapodilla", "Trees", 5, 45,
     "Even moisture, deep watering.",
     "Manure twice a year.",
     "Bud borer. Prune affected tips."),
    ("bel", "Bel", "Aegle marmelos", "bael wood apple", "Trees", 6, 55,
     "Very drought hardy once established.",
     "Compost once a year.",
     "Largely untroubled."),
    ("silver-oak", "Silver oak", "Grevillea robusta", "silver oak", "Trees", 4, 50,
     "Water weekly while young.",
     "Light compost once a year. It dislikes rich phosphorus.",
     "Few problems. Watch for scale on young stems."),
    ("teak", "Teak", "Tectona grandis", "sagwan sagon", "Trees", 5, 55,
     "Deep water in the first two summers.",
     "Compost at the start of the rains.",
     "Teak defoliator in the monsoon. Hand-pick while numbers are small."),

    # Flowering
    ("hibiscus", "Hibiscus", "Hibiscus rosa-sinensis", "gudhal jaswand china rose", "Flowering", 2, 25,
     "Water daily in summer, half that once it cools.",
     "Potash-rich feed while it is flowering.",
     "Aphids on buds, and bud drop from mealybug. Soapy water first, neem oil only if it spreads."),
    ("rose", "Rose", "Rosa indica", "gulab", "Flowering", 2, 20,
     "Water at the base in the morning, never on the leaves.",
     "Compost plus bone meal every three weeks in season.",
     "Black spot, aphids and thrips. Remove affected leaves and improve airflow before spraying."),
    ("jasmine", "Jasmine", "Jasminum sambac", "mogra mallige chameli", "Flowering", 2, 25,
     "Keep evenly moist while flowering.",
     "Compost monthly through the flowering season.",
     "Budworm and aphids. Pinch off affected buds."),
    ("marigold", "Marigold", "Tagetes erecta", "genda", "Flowering", 2, 20,
     "Water at the base, keep the flowers dry.",
     "Compost every three weeks.",
     "Red spider mite in dry heat. Spray the undersides with water."),
    ("bougainvillea", "Bougainvillea", "Bougainvillea glabra", "kagaz phool boganvilla", "Flowering", 6, 45,
     "Keep it thirsty. It flowers when it is slightly stressed.",
     "Very little. Too much feed gives leaves and no colour.",
     "Mealybug and caterpillars. Prune hard after flowering."),
    ("plumeria", "Plumeria", "Plumeria rubra", "champa frangipani", "Flowering", 6, 45,
     "Let it dry between waterings, almost none in winter.",
     "Compost twice in the growing season.",
     "Plumeria rust, orange dust on the leaf undersides. Remove affected leaves."),
    ("oleander", "Oleander", "Nerium oleander", "kaner", "Flowering", 4, 40,
     "Drought tolerant once established.",
     "Compost twice a year.",
     "Oleander caterpillar. Hand-pick, and wear gloves, the sap irritates."),
    ("ixora", "Ixora", "Ixora coccinea", "rugmini chethi", "Flowering", 3, 30,
     "Even moisture and slightly acid soil.",
     "Compost monthly, it likes a slightly acid feed.",
     "Scale and sooty mould. Wipe the leaves."),
    ("periwinkle", "Periwinkle", "Catharanthus roseus", "sadabahar sadaphuli", "Flowering", 3, 30,
     "Let the top dry out. It hates wet feet.",
     "Very little. It flowers on poor soil.",
     "Root rot from overwatering is the real risk."),
    ("chandni", "Chandni", "Tabernaemontana divaricata", "crape jasmine tagar", "Flowering", 3, 30,
     "Steady moisture in summer.",
     "Compost every two months.",
     "Mealybug in the leaf joints."),
    ("tecoma", "Tecoma", "Tecoma stans", "yellow bells", "Flowering", 4, 40,
     "Dry between waterings.",
     "Light compost twice a year.",
     "Few problems."),
    ("chrysanthemum", "Chrysanthemum", "Chrysanthemum indicum", "guldaudi sevanti", "Flowering", 2, 20,
     "Keep moist while it is budding.",
     "Compost every two weeks in bud.",
     "Aphids and leaf miner."),
    ("crossandra", "Crossandra", "Crossandra infundibuliformis", "abli kanakambaram", "Flowering", 2, 25,
     "Evenly moist, warm and bright.",
     "Compost monthly.",
     "Nematodes in old soil. Repot rather than treat."),

    # Herbs
    ("tulsi", "Tulsi", "Ocimum tenuiflorum", "holy basil vrinda", "Herbs", 2, 30,
     "Morning water, and pinch the flower spikes off.",
     "A pinch of vermicompost every few weeks. It wants little and often.",
     "Aphids and whitefly on the new growth. A spray of water with a little soap clears them."),
    ("basil", "Basil", "Ocimum basilicum", "sweet basil sabja", "Herbs", 2, 25,
     "Water in the morning, keep the leaves dry.",
     "Light compost every three weeks.",
     "Aphids and whitefly. Soapy water."),
    ("mint", "Mint", "Mentha spicata", "pudina", "Herbs", 2, 25,
     "Likes it damp. Keep it in its own pot or it takes over.",
     "Compost monthly.",
     "Rust, orange spots underneath. Cut it back hard."),
    ("coriander", "Coriander", "Coriandrum sativum", "dhania cilantro", "Herbs", 2, 25,
     "Steady moisture, and shade in peak summer.",
     "Light compost every three weeks.",
     "Aphids. Rinse them off."),
    ("lemongrass", "Lemongrass", "Cymbopogon citratus", "nimbu ghas", "Herbs", 3, 35,
     "Water well in summer, less in winter.",
     "Compost twice a year.",
     "Rust in humid weather. Thin the clump."),
    ("ajwain-plant", "Ajwain plant", "Plectranthus amboinicus", "owa cuban oregano pathar chur", "Herbs", 4, 35,
     "Let it dry between waterings, it stores water.",
     "Very little compost.",
     "Mealybug. Wipe off with cotton."),
    ("chilli", "Chilli", "Capsicum annuum", "mirchi pepper", "Herbs", 2, 25,
     "Even moisture while fruiting.",
     "Compost every three weeks.",
     "Thrips and leaf curl. Remove curled leaves early."),
    ("ginger", "Ginger", "Zingiber officinale", "adrak", "Herbs", 3, 35,
     "Moist and shaded, never waterlogged.",
     "Compost monthly in the growing season.",
     "Rhizome rot in wet soil. Improve the drainage."),
    ("turmeric", "Turmeric", "Curcuma longa", "haldi", "Herbs", 3, 35,
     "Keep damp through the growing season.",
     "Compost monthly.",
     "Leaf spot. Remove affected leaves."),
    ("aloe", "Aloe vera", "Aloe barbadensis", "gwarpatha ghritkumari", "Herbs", 10, 90,
     "Far less water than feels right. Let it dry out.",
     "Almost nothing. A little compost once a year.",
     "Root rot from overwatering is the real risk, not pests."),
    ("stevia", "Stevia", "Stevia rebaudiana", "meethi tulsi", "Herbs", 2, 30,
     "Keep lightly moist, it has shallow roots.",
     "Light compost monthly.",
     "Few problems. Pinch the tips to keep it bushy."),

    # Vegetables
    ("tomato", "Tomato", "Solanum lycopersicum", "tamatar", "Vegetables", 2, 20,
     "Water at the base, evenly. Uneven water splits the fruit.",
     "Compost every two weeks once it sets fruit.",
     "Fruit borer and early blight. Remove the lower leaves that touch the soil."),
    ("brinjal", "Brinjal", "Solanum melongena", "baingan eggplant aubergine", "Vegetables", 2, 25,
     "Steady moisture while fruiting.",
     "Compost every three weeks.",
     "Shoot and fruit borer. Cut off wilting shoots."),
    ("okra", "Okra", "Abelmoschus esculentus", "bhindi ladies finger", "Vegetables", 2, 25,
     "Water deeply twice a week in summer.",
     "Compost every three weeks.",
     "Yellow vein mosaic, carried by whitefly. Remove infected plants."),
    ("spinach", "Spinach", "Spinacia oleracea", "palak", "Vegetables", 2, 20,
     "Keep the soil damp, it bolts if it dries.",
     "Light compost every two weeks.",
     "Leaf miner. Pick the tunnelled leaves off."),
    ("bottle-gourd", "Bottle gourd", "Lagenaria siceraria", "lauki dudhi", "Vegetables", 2, 25,
     "Water at the base, deeply.",
     "Compost every three weeks.",
     "Fruit fly. Bag the young fruit."),
    ("bitter-gourd", "Bitter gourd", "Momordica charantia", "karela", "Vegetables", 2, 25,
     "Even moisture on a trellis.",
     "Compost every three weeks.",
     "Fruit fly. Traps work better than spray."),
    ("cucumber", "Cucumber", "Cucumis sativus", "kheera", "Vegetables", 2, 20,
     "Consistent water, or the fruit turns bitter.",
     "Compost every two weeks.",
     "Powdery mildew. Improve airflow, water in the morning."),
    ("beans", "Beans", "Phaseolus vulgaris", "sem french beans", "Vegetables", 2, 25,
     "Water at the base, keep the foliage dry.",
     "Little feed. Beans make their own nitrogen.",
     "Pod borer. Pick affected pods."),

    # Indoors
    ("money-plant", "Money plant", "Epipremnum aureum", "pothos devils ivy", "Indoors", 6, 40,
     "Wait until the top inch is properly dry.",
     "Quarter-strength liquid feed, and skip it in winter.",
     "Mealybug in the leaf joints. Dab with cotton and diluted alcohol."),
    ("snake-plant", "Snake plant", "Sansevieria trifasciata", "sansevieria nag phani", "Indoors", 14, 90,
     "Almost never. Once a fortnight is plenty.",
     "A little compost once a year.",
     "Root rot from overwatering. Nothing else bothers it."),
    ("jade", "Jade plant", "Crassula ovata", "crassula money tree", "Indoors", 10, 60,
     "Let it dry right out between waterings.",
     "Very little, twice a year.",
     "Mealybug. Cotton and alcohol."),
    ("spider-plant", "Spider plant", "Chlorophytum comosum", "airplane plant", "Indoors", 5, 40,
     "Keep lightly moist, it browns at the tips if starved.",
     "Light feed monthly in summer.",
     "Brown tips are usually the water, not a pest."),
    ("peace-lily", "Peace lily", "Spathiphyllum wallisii", "spathiphyllum", "Indoors", 4, 40,
     "It droops when thirsty and recovers fast. Try not to make that the routine.",
     "Light feed every six weeks.",
     "Scale on the undersides. Wipe them off."),
    ("areca-palm", "Areca palm", "Dypsis lutescens", "butterfly palm", "Indoors", 4, 45,
     "Keep the root ball damp, never soggy.",
     "Compost twice a year.",
     "Spider mite in dry air. Mist and hose the leaves."),
    ("rubber-plant", "Rubber plant", "Ficus elastica", "rubber fig", "Indoors", 7, 45,
     "Let the top two inches dry first.",
     "Feed monthly in summer only.",
     "Scale. Wipe the leaves with soapy water."),
    ("monstera", "Monstera", "Monstera deliciosa", "swiss cheese plant", "Indoors", 7, 40,
     "Water when the top two inches are dry.",
     "Monthly feed in the growing season.",
     "Spider mite in dry air. Raise the humidity."),
    ("zz-plant", "ZZ plant", "Zamioculcas zamiifolia", "zanzibar gem", "Indoors", 14, 90,
     "Forget about it. That is the care instruction.",
     "Twice a year at most.",
     "Almost nothing. Rot is the only real risk."),
    ("syngonium", "Syngonium", "Syngonium podophyllum", "arrowhead plant", "Indoors", 5, 40,
     "Keep lightly moist.",
     "Light feed monthly.",
     "Mealybug. Cotton and alcohol."),
    ("fern", "Fern", "Nephrolepis exaltata", "boston fern", "Indoors", 3, 40,
     "Never let it dry out, and keep the air humid.",
     "Light feed every six weeks.",
     "Brown fronds are usually dry air."),
    ("anthurium", "Anthurium", "Anthurium andraeanum", "flamingo flower", "Indoors", 5, 40,
     "Moist but airy. It hates dense wet soil.",
     "Light feed monthly in summer.",
     "Scale and mealybug. Wipe them off."),
    ("croton", "Croton", "Codiaeum variegatum", "garden croton", "Indoors", 4, 35,
     "Even moisture and strong light for the colour.",
     "Compost every two months.",
     "Spider mite. Hose the undersides."),
    ("coleus", "Coleus", "Plectranthus scutellarioides", "painted nettle", "Indoors", 2, 30,
     "Keep damp, and pinch the flower spikes off.",
     "Light feed every three weeks.",
     "Mealybug and whitefly."),
    ("cactus", "Cactus", "Echinopsis oxygona", "cacti", "Indoors", 21, 120,
     "Water deeply, then leave it for weeks.",
     "Almost never.",
     "Mealybug in the crevices. Rot from kindness."),
    ("lucky-bamboo", "Lucky bamboo", "Dracaena sanderiana", "dracaena", "Indoors", 7, 60,
     "In water, change it fortnightly. In soil, keep it lightly damp.",
     "A drop of feed every couple of months.",
     "Yellowing is usually the water, not a pest."),

    # Anything else.
    #
    # Naming a plant and knowing how to keep it alive are two different jobs.
    # Identification answers the first, and these answer the second for
    # everything the list above does not carry. They are deliberately coarse,
    # because somebody who does not know the species still knows whether the
    # thing in front of them is a tree in the ground or a succulent on a
    # windowsill, and those two want opposite treatment.
    ("other-tree", "Any other tree", "", "tree sapling unknown other", "Anything else", 4, 50,
     "Deep water at the drip line rather than a daily splash. Less often as it establishes.",
     "Compost or well-rotted manure at the drip line, once or twice a year.",
     "Look under the leaves and along the trunk. Most tree trouble shows there first."),
    ("other-flowering", "Any other flowering plant", "", "flower shrub unknown other", "Anything else", 2, 25,
     "Water at the base in the morning. Keep the flowers and leaves dry.",
     "Compost every three weeks while it is flowering, less once it stops.",
     "Aphids and mites on the buds and new growth. Soapy water before anything stronger."),
    ("other-herb", "Any other herb or vegetable", "", "herb vegetable edible unknown other", "Anything else", 2, 25,
     "Keep it evenly damp. Most of these bolt or drop fruit if they dry out and then flood.",
     "Light compost every two or three weeks through the growing season.",
     "Check the undersides weekly. Anything you eat is better hand-picked than sprayed."),
    ("other-succulent", "Any other succulent or cactus", "", "succulent cactus aloe unknown other", "Anything else", 14, 90,
     "Far less than feels right. Let it dry right through, then water deeply.",
     "Almost nothing. A little compost once a year.",
     "Rot from kindness is the real risk. Mealybug in the crevices otherwise."),
    ("other-indoor", "Any other houseplant", "", "indoor houseplant pot unknown other", "Anything else", 6, 40,
     "Wait until the top inch is properly dry, then water until it runs through.",
     "Quarter-strength liquid feed monthly in summer, none in winter.",
     "Mealybug in the leaf joints and scale on the undersides. Wipe them off."),
]

# Only these have a photograph. The rest are found by name, which is why the
# picker leads with a search box rather than a wall of pictures.
PHOTOS = {
    "neem": "/plants/neem.jpg",
    "peepal": "/plants/peepal.jpg",
    "mango": "/plants/mango.jpg",
    "banyan": "/plants/peepal.jpg",
    "gulmohar": "/plants/hibiscus.jpg",
    "tulsi": "/plants/tulsi.jpg",
    "money-plant": "/plants/money-plant.jpg",
    "curry-leaf": "/plants/neem.jpg",
    "hibiscus": "/plants/hibiscus.jpg",
    "aloe": "/plants/aloe.jpg",
    "jamun": "/plants/mango.jpg",
    "ashoka": "/plants/sapling.jpg",
}

# The demo account and the seeded plants name these, so losing one breaks the
# app rather than shortening a list.
REQUIRED = ["neem", "peepal", "mango", "banyan", "gulmohar", "tulsi",
            "money-plant", "curry-leaf", "hibiscus", "aloe", "jamun", "ashoka"]


def main() -> None:
    ids = [r[0] for r in ROWS]
    assert len(ids) == len(set(ids)), "duplicate species id"
    for need in REQUIRED:
        assert need in ids, f"missing required species: {need}"
    for sid in PHOTOS:
        assert sid in ids, f"photo for unknown species: {sid}"

    def q(text: str) -> str:
        return text.replace("\\", "\\\\").replace('"', '\\"')

    blocks = []
    for sid, name, latin, aka, group, water, feed_days, advice, feed, pest in ROWS:
        photo = f'\n    photo: "{PHOTOS[sid]}",' if sid in PHOTOS else ""
        blocks.append(
            f'  {{\n'
            f'    id: "{sid}",\n'
            f'    name: "{q(name)}",\n'
            f'    latin: "{q(latin)}",\n'
            f'    aka: "{q(aka)}",\n'
            f'    group: "{group}",\n'
            f'    waterEvery: {water},\n'
            f'    fertiliseEvery: {feed_days},\n'
            f'    advice: "{q(advice)}",\n'
            f'    feedWith: "{q(feed)}",\n'
            f'    pestWatch: "{q(pest)}",{photo}\n'
            f'  }},'
        )

    root = pathlib.Path(__file__).resolve().parent.parent
    path = root / "web" / "lib" / "data.ts"
    src = path.read_text(encoding="utf-8")

    start = src.index("export const SPECIES: Species[] = [")
    end = src.index("export const PLANTS: Plant[] = [")
    src = (
        src[:start]
        + "export const SPECIES: Species[] = [\n"
        + "\n".join(blocks)
        + "\n];\n\n"
        + src[end:]
    )

    src = src.replace(
        """  /** Photograph under public/plants. A plant is known by sight, not by name. */
  photo: string;
};""",
        """  /** Other names people actually use for it, so a search finds it. */
  aka: string;
  /** Trees, Flowering, Herbs, Vegetables or Indoors. */
  group: string;
  /** Photograph under public/plants, where there is one. */
  photo?: string;
};""",
    )

    path.write_text(src, encoding="utf-8", newline="\n")
    groups = {}
    for r in ROWS:
        groups[r[4]] = groups.get(r[4], 0) + 1
    print(f"{len(ROWS)} species written to {path}")
    for g, n in groups.items():
        print(f"  {g:<12} {n}")


if __name__ == "__main__":
    main()
