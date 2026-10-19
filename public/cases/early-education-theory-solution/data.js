/*
 * Question bank for the Logic Blueprint Challenge (static version, no AI, no internet).
 * Edit this file to change questions. After editing, run:  node check-data.js
 *
 * Each landmark:
 *   id        unique number, matches the drawing in blueprints.js
 *   name      shown only on the final screen
 *   category / country / city   the three correct answers (the hidden variables)
 *   wrong     exactly 2 wrong options for each of the three levels
 *   intro     ONE sentence shown on the final screen (it may reveal the answer)
 */
window.LANDMARKS = [
  { id: 1, name: 'Eiffel Tower', category: 'Tower', country: 'France', city: 'Paris',
    wrong: { category: ['Bridge', 'Temple'], country: ['Italy', 'Belgium'], city: ['Lyon', 'Marseille'] },
    intro: 'Identification Complete: This is the Eiffel Tower in Paris, an iron lattice tower finished in 1889.' },

  { id: 2, name: 'Statue of Liberty', category: 'Statue', country: 'USA', city: 'New York City',
    wrong: { category: ['Bridge', 'Palace'], country: ['Canada', 'Mexico'], city: ['Boston', 'Washington D.C.'] },
    intro: 'Identification Complete: This is the Statue of Liberty in New York City, a copper statue given to the United States by France.' },

  { id: 3, name: 'Pyramids of Giza', category: 'Pyramid', country: 'Egypt', city: 'Giza',
    wrong: { category: ['Temple', 'Castle'], country: ['Morocco', 'Jordan'], city: ['Luxor', 'Alexandria'] },
    intro: 'Identification Complete: These are the Pyramids of Giza in Egypt, royal tombs built more than 4,000 years ago.' },

  { id: 4, name: 'Sydney Opera House', category: 'Opera House', country: 'Australia', city: 'Sydney',
    wrong: { category: ['Museum', 'Stadium'], country: ['New Zealand', 'South Africa'], city: ['Melbourne', 'Canberra'] },
    intro: 'Identification Complete: This is the Sydney Opera House in Sydney, famous for its sail-shaped roofs beside the harbour.' },

  { id: 5, name: 'Colosseum', category: 'Amphitheater', country: 'Italy', city: 'Rome',
    wrong: { category: ['Temple', 'Palace'], country: ['Greece', 'Spain'], city: ['Naples', 'Milan'] },
    intro: 'Identification Complete: This is the Colosseum in Rome, a giant stone arena that once hosted gladiator contests.' },

  { id: 6, name: 'Taj Mahal', category: 'Mausoleum', country: 'India', city: 'Agra',
    wrong: { category: ['Palace', 'Mosque'], country: ['Pakistan', 'Iran'], city: ['Delhi', 'Jaipur'] },
    intro: 'Identification Complete: This is the Taj Mahal in Agra, a white marble tomb built by Emperor Shah Jahan for his wife.' },

  { id: 7, name: 'Forbidden City', category: 'Palace', country: 'China', city: 'Beijing',
    wrong: { category: ['Temple', 'Fortress'], country: ['Japan', 'South Korea'], city: ['Shanghai', "Xi'an"] },
    intro: 'Identification Complete: This is the Forbidden City in Beijing, the imperial palace of Chinese emperors for about 500 years.' },

  { id: 8, name: 'Golden Gate Bridge', category: 'Bridge', country: 'USA', city: 'San Francisco',
    wrong: { category: ['Dam', 'Tunnel'], country: ['Canada', 'Australia'], city: ['Los Angeles', 'Seattle'] },
    intro: 'Identification Complete: This is the Golden Gate Bridge in San Francisco, an orange suspension bridge that opened in 1937.' },

  { id: 9, name: 'Burj Khalifa', category: 'Skyscraper', country: 'UAE', city: 'Dubai',
    wrong: { category: ['Bridge', 'Stadium'], country: ['Saudi Arabia', 'Qatar'], city: ['Abu Dhabi', 'Sharjah'] },
    intro: 'Identification Complete: This is the Burj Khalifa in Dubai, the tallest building in the world at about 828 meters.' },

  { id: 10, name: 'Christ the Redeemer', category: 'Statue', country: 'Brazil', city: 'Rio de Janeiro',
    wrong: { category: ['Temple', 'Bridge'], country: ['Argentina', 'Portugal'], city: ['São Paulo', 'Salvador'] },
    intro: 'Identification Complete: This is Christ the Redeemer in Rio de Janeiro, a huge statue standing on Corcovado mountain.' },

  { id: 11, name: 'Angkor Wat', category: 'Temple', country: 'Cambodia', city: 'Siem Reap',
    wrong: { category: ['Palace', 'Fortress'], country: ['Thailand', 'Vietnam'], city: ['Phnom Penh', 'Bangkok'] },
    intro: 'Identification Complete: This is Angkor Wat near Siem Reap, a vast temple complex built in the 12th century.' },

  { id: 12, name: 'Sagrada Família', category: 'Basilica', country: 'Spain', city: 'Barcelona',
    wrong: { category: ['Castle', 'Museum'], country: ['Portugal', 'Italy'], city: ['Madrid', 'Seville'] },
    intro: 'Identification Complete: This is the Sagrada Família in Barcelona, a basilica with tall spires designed by Antoni Gaudí.' },

  { id: 13, name: 'Leaning Tower of Pisa', category: 'Tower', country: 'Italy', city: 'Pisa',
    wrong: { category: ['Bridge', 'Castle'], country: ['France', 'Greece'], city: ['Florence', 'Venice'] },
    intro: 'Identification Complete: This is the Leaning Tower of Pisa in Pisa, a bell tower famous for its tilt.' },

  { id: 14, name: 'Tower Bridge', category: 'Bridge', country: 'UK', city: 'London',
    wrong: { category: ['Dam', 'Castle'], country: ['Ireland', 'Netherlands'], city: ['Manchester', 'Edinburgh'] },
    intro: 'Identification Complete: This is Tower Bridge in London, a bridge over the River Thames whose middle section lifts to let ships pass.' },

  { id: 15, name: 'Brandenburg Gate', category: 'Gate', country: 'Germany', city: 'Berlin',
    wrong: { category: ['Bridge', 'Palace'], country: ['Austria', 'Poland'], city: ['Munich', 'Hamburg'] },
    intro: 'Identification Complete: This is the Brandenburg Gate in Berlin, an 18th-century stone gate topped by a chariot statue.' },

  { id: 16, name: 'Petronas Towers', category: 'Skyscraper', country: 'Malaysia', city: 'Kuala Lumpur',
    wrong: { category: ['Temple', 'Dam'], country: ['Indonesia', 'Thailand'], city: ['Penang', 'Singapore'] },
    intro: 'Identification Complete: These are the Petronas Towers in Kuala Lumpur, twin skyscrapers joined by a sky bridge.' },

  { id: 17, name: 'Himeji Castle', category: 'Castle', country: 'Japan', city: 'Himeji',
    wrong: { category: ['Temple', 'Palace'], country: ['China', 'South Korea'], city: ['Osaka', 'Kyoto'] },
    intro: 'Identification Complete: This is Himeji Castle in Himeji, a gleaming white castle nicknamed the White Heron Castle.' },

  { id: 18, name: 'CN Tower', category: 'Tower', country: 'Canada', city: 'Toronto',
    wrong: { category: ['Bridge', 'Palace'], country: ['USA', 'Australia'], city: ['Vancouver', 'Montreal'] },
    intro: 'Identification Complete: This is the CN Tower in Toronto, a concrete communications tower about 553 meters tall.' },

  { id: 19, name: "Saint Basil's Cathedral", category: 'Cathedral', country: 'Russia', city: 'Moscow',
    wrong: { category: ['Mosque', 'Palace'], country: ['Ukraine', 'Finland'], city: ['Saint Petersburg', 'Kazan'] },
    intro: "Identification Complete: This is Saint Basil's Cathedral in Moscow, a church with colorful onion domes on Red Square." },

  { id: 20, name: 'Atomium', category: 'Monument', country: 'Belgium', city: 'Brussels',
    wrong: { category: ['Bridge', 'Castle'], country: ['Netherlands', 'Luxembourg'], city: ['Antwerp', 'Bruges'] },
    intro: 'Identification Complete: This is the Atomium in Brussels, a building made of nine steel spheres shaped like an iron crystal.' }
];

/*
 * Starting clues (3 per landmark) shown at the very beginning so children can think instead of guessing.
 * Rules: describe what it LOOKS like or is MADE of. Never use the name, the country, the city,
 * the type word (tower, bridge, statue ...), or words like French/Egyptian. check-data.js enforces this.
 */
(function () {
  var CLUES = {
    1: ['It is made of iron bars that cross each other like a puzzle.', 'It gets thinner and thinner as it goes up to the sky.', 'It stands on four big legs and has a pointy top.'],
    2: ['A tall lady holds a torch high up in the air.', 'Her crown has spikes that look like rays of the sun.', 'She is made of copper that has turned green, and she stands on a big stone base.'],
    3: ['It has flat sides that all meet at one point at the top.', 'It is built from giant stone blocks.', 'There are three big ones standing in a row, and they are more than four thousand years old.'],
    4: ['Its roof looks like a bunch of white sails.', 'It sits right next to the water.', 'Its curved shells are covered with shiny tiles.'],
    5: ['It is a giant round building with no roof in the middle.', 'Its walls have rows and rows of arches.', 'Long ago, big crowds sat here to watch exciting shows.'],
    6: ['It is made of shiny white marble.', 'It has a big round dome in the middle and four thin pillars around it.', 'A long pool in front of it shows its reflection like a mirror.'],
    7: ['Its roofs are golden-yellow and curve up at the corners.', 'Red walls and red doors are everywhere.', 'A wide ditch full of water and very tall walls go all the way around it.'],
    8: ['It is painted a bright orange-red color.', 'Two tall towers hold up giant ropes that swoop down like a smile.', 'Cars and people go across it, high above the water.'],
    9: ['It is the tallest building in the whole world.', 'It looks like a giant needle that gets thinner at the top.', 'It has more than one hundred and sixty floors.'],
    10: ['A giant figure stands with both arms stretched out wide.', 'It stands on top of a mountain, high above the land and sea.', 'It is built from lots of small stone pieces.'],
    11: ['It has five tall points shaped like lotus flowers that have not opened yet.', 'Stone stairs go up in layers, like a giant cake.', 'Water goes all the way around it, and pictures are carved into its walls.'],
    12: ['It has many pointy spires, like sandcastles made from dripping wet sand.', 'People have been building it for more than one hundred years, and it is still not finished.', 'Its walls are decorated with shapes from nature, like trees and leaves.'],
    13: ['It is round and has lots of floors with little arches.', 'It leans to one side, and it looks like it might fall over.', 'It is made of white marble and has a room with bells at the top.'],
    14: ['Its middle part can lift up like two giant doors to let boats pass through.', 'Two stone pillars with pointy tops stand on each side.', 'Blue steel beams hang between the pillars, high above the water.'],
    15: ['It has twelve tall stone columns.', 'Five open walkways go through it.', 'On top, four horses pull a cart that is driven by a lady with wings.'],
    16: ['There are two matching buildings standing side by side.', 'They look like shiny silver stacks with pointy tops.', 'A walkway high in the sky joins them in the middle.'],
    17: ['Its walls are bright white, like the feathers of a bird.', 'Its roofs are stacked on top of each other and get smaller as they go up.', 'Archers used to shoot from tiny holes in its thick walls.'],
    18: ['It is a super thin concrete pole that reaches up into the clouds.', 'Near the top there is a round pod where you can walk around and look out.', 'It has a glass floor that you can stand on and look straight down.'],
    19: ['It has colorful domes shaped like onions.', 'Each dome has different stripes, swirls, or zigzags.', 'A tall pointy roof stands in the middle, with smaller ones all around it.'],
    20: ['It is made of nine shiny silver balls.', 'Long tubes connect the balls to each other, like a giant toy.', 'It looks like a tiny crystal that has been made much, much bigger.']
  };
  (window.LANDMARKS || []).forEach(function (L) { L.clues = CLUES[L.id]; });
})();
