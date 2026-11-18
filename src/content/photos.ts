/**
 * Bundled photography, stored locally in /public/images/photos.
 *
 * All photographs come from Wikimedia Commons under Creative Commons
 * licences that permit reuse with attribution (CC BY / CC BY-SA). Credits are
 * kept here, seeded into the media library, and shown on the public
 * /credits page. If you replace a photo, update its credit.
 */
import type { ImageRef } from "../lib/types.ts";

export type BundledPhoto = ImageRef & {
  file: string;
  width: number;
  height: number;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  caption: string;
  folder: string;
};

function photo(p: Omit<BundledPhoto, "src" | "credit">): BundledPhoto {
  return {
    ...p,
    src: `/images/photos/${p.file}`,
    credit: `${p.author}, ${p.license}, via Wikimedia Commons`,
  };
}

export const PHOTOS = {
  elephantsFamily: photo({
    file: "elephants-family.jpg",
    width: 2000,
    height: 1333,
    alt: "An African bush elephant walking along a track through green bush with her young calf",
    caption: "African bush elephant with her six-week-old calf, Zimbabwe",
    author: "Charles J. Sharp",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:African_bush_elephants_(Loxodonta_africana)_female_with_six-week-old_baby.jpg",
    folder: "Wildlife",
  }),
  elephantsChobe: photo({
    file: "elephants-chobe.jpg",
    width: 2000,
    height: 1322,
    alt: "Two young African bush elephants walking together across a sandy riverbank",
    caption: "Young African bush elephants, Chobe National Park, Botswana",
    author: "Diego Delso",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Elefantes_africanos_de_sabana_(Loxodonta_africana),_parque_nacional_de_Chobe,_Botsuana,_2018-07-28,_DD_25.jpg",
    folder: "Wildlife",
  }),
  crane: photo({
    file: "grey-crowned-crane.jpg",
    width: 2000,
    height: 1333,
    alt: "A Grey Crowned Crane with its golden crest walking at the edge of shallow water",
    caption: "Grey Crowned Crane, Arusha National Park, Tanzania",
    author: "Charles J. Sharp",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Grey_crowned_crane_(Balearica_regulorum_gibbericeps)_male_Arusha.jpg",
    folder: "Wildlife",
  }),
  craneWetland: photo({
    file: "grey-crowned-crane-wetland.jpg",
    width: 2000,
    height: 1333,
    alt: "A Grey Crowned Crane standing in tall wetland grasses",
    caption: "Grey Crowned Crane near Lake Bunyonyi, Uganda",
    author: "Charles J. Sharp",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Grey_crowned_crane_(Balearica_regulorum_gibbericeps).jpg",
    folder: "Wildlife",
  }),
  nyungweSunrise: photo({
    file: "rwanda-hills-sunrise.jpg",
    width: 2000,
    height: 1586,
    alt: "Sunrise over layered forested hills in Nyungwe, Rwanda",
    caption: "Sunrise over the hills of Nyungwe, Rwanda",
    author: "Jonkmania",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Sunrisenyungwe.jpg",
    folder: "Landscapes",
  }),
  nyungweForest: photo({
    file: "nyungwe-forest.jpg",
    width: 2000,
    height: 1333,
    alt: "Montane rainforest trees in Nyungwe Forest National Park, Rwanda",
    caption: "Nyungwe Forest National Park, Rwanda",
    author: "Brian Harries",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Nyungwe_Forest_NP_20150928-DSCF4880.jpg",
    folder: "Landscapes",
  }),
  rugezi: photo({
    file: "rugezi-wetland.jpg",
    width: 2000,
    height: 1497,
    alt: "Channels of water winding through the green Rugezi wetland beneath rolling hills",
    caption: "Rugezi wetland, northern Rwanda",
    author: "Bisoke",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Rugezi_wetland_(cropped).jpg",
    folder: "Landscapes",
  }),
  gorilla: photo({
    file: "mountain-gorilla.jpg",
    width: 2000,
    height: 1333,
    alt: "A mountain gorilla sitting among green leaves in Volcanoes National Park, Rwanda",
    caption: "Mountain gorilla of the Susa group, Volcanoes National Park, Rwanda",
    author: "Emmanuel Kwizera",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Mountain_gorilla_from_Susa_Group_in_Karisimbi_thicket_of_Volcanoes_National_Park_in_Rwanda._Emmanuel_Kwizera.jpg",
    folder: "Wildlife",
  }),
  akagera: photo({
    file: "akagera-waterbirds.jpg",
    width: 2000,
    height: 1333,
    alt: "Cormorants perched on small islands in calm water fringed by papyrus in Akagera National Park",
    caption: "Waterbirds in Akagera National Park, Rwanda",
    author: "John Cooke",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Birds_at_a_Watering_Hole_in_Akagera_National_Park.jpg",
    folder: "Wildlife",
  }),
  lakeKivu: photo({
    file: "lake-kivu.jpg",
    width: 2000,
    height: 1333,
    alt: "Forested shoreline and calm water of Lake Kivu, Rwanda",
    caption: "Lake Kivu, western Rwanda",
    author: "Muhirehussein12",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Lake_Kivu_(_Rwanda_).jpg",
    folder: "Landscapes",
  }),
  youthPlanting: photo({
    file: "youth-tree-planting.jpg",
    width: 2000,
    height: 1333,
    alt: "Young people kneeling together to plant seedlings in Rwanda",
    caption: "Young people planting trees in Rwanda",
    author: "Germain92",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Tree_planting_in_Rwanda.jpg",
    folder: "Community",
  }),
  communityKivu: photo({
    file: "community-planting-kivu.jpg",
    width: 2000,
    height: 1333,
    alt: "A young man planting a seedling on a hillside above Lake Kivu while others work nearby",
    caption: "Community tree planting above Lake Kivu, Rwanda",
    author: "Rogerirakoze",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Gutera_igiti.jpg",
    folder: "Community",
  }),
  youthGroup: photo({
    file: "youth-seedlings-group.jpg",
    width: 2000,
    height: 1333,
    alt: "A group of young people holding tree seedlings during a planting campaign",
    caption: "Young people on a tree planting campaign",
    author: "Atwijukirenaomi",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:On_a_tree_planting_campaign.jpg",
    folder: "Community",
  }),
  wetlandPlanting: photo({
    file: "community-wetland-planting.jpg",
    width: 2000,
    height: 1333,
    alt: "Two people planting vegetation among green plants as part of wetland protection in Rwanda",
    caption: "Wetland protection work in Rwanda",
    author: "Germain92",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Wetlands_in_Rwanda.jpg",
    folder: "Community",
  }),
  chimpanzee: photo({
    file: "chimpanzee.jpg",
    width: 1600,
    height: 1067,
    alt: "An eastern chimpanzee sitting among forest vegetation",
    caption: "Eastern chimpanzee, Kibale Forest, Uganda",
    author: "Charles J. Sharp",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Common_chimpanzee_(Pan_troglodytes_schweinfurthii)_Kibale.jpg",
    folder: "Wildlife",
  }),
  turaco: photo({
    file: "great-blue-turaco.jpg",
    width: 1600,
    height: 1067,
    alt: "A great blue turaco perched on a branch, showing its blue-green plumage and dark crest",
    caption: "Great blue turaco, Kibale Forest, Uganda",
    author: "Charles J. Sharp",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Great_blue_turaco_(Corythaeola_cristata).jpg",
    folder: "Wildlife",
  }),
  hippo: photo({
    file: "hippopotamus.jpg",
    width: 1600,
    height: 1067,
    alt: "A hippopotamus partly submerged in calm water",
    caption: "Hippopotamus, Kazinga Channel, Queen Elizabeth National Park, Uganda",
    author: "Charles J. Sharp",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Hippopotamus_(Hippopotamus_amphibius)_2.jpg",
    folder: "Wildlife",
  }),
  kingfisher: photo({
    file: "malachite-kingfisher.jpg",
    width: 1600,
    height: 1600,
    alt: "A malachite kingfisher with a bright orange breast and blue back perched on a reed",
    caption: "Malachite kingfisher, Lake Baringo, Kenya",
    author: "Charles J. Sharp",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Malachite_kingfisher_(Corythornis_cristatus_cristatus).jpg",
    folder: "Wildlife",
  }),
  monarch: photo({
    file: "african-monarch.jpg",
    width: 1600,
    height: 1066,
    alt: "An African monarch butterfly with orange, black and white wings resting on a plant",
    caption: "African monarch butterfly, Lake Sibaya, South Africa",
    author: "Charles J. Sharp",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:African_monarch_butterfly_(Danaus_chrysippus).jpg",
    folder: "Wildlife",
  }),
} satisfies Record<string, BundledPhoto>;

export const ALL_PHOTOS: BundledPhoto[] = Object.values(PHOTOS);

/** Image reference (src, alt, credit) suitable for storing in content. */
export function ref(p: BundledPhoto): ImageRef {
  return { src: p.src, alt: p.alt, credit: p.credit };
}
