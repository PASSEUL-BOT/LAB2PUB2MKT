/* config.js - levels, classes and settings.  Kept apart from the screens.
 * build(taxonomy) works in the browser and in Node (for the tests). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.OAE = root.OAE || {}; root.OAE.Config = factory(); if (root.OAE.data) root.OAE.cfg = root.OAE.Config.build(root.OAE.data.taxonomy); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var COLORS = ['#19b7c9', '#ff7a9a', '#ffb703', '#5fd3a0', '#8f7cf0', '#ff8f3d', '#3f8ef5', '#e86fd1', '#9ccc3c', '#2ec4b6', '#d98c5f', '#7a8bff', '#f25f5c'];
  // Chosen by trying several settings on the validation/test-free experiments in tools/ (see README): stable across random seeds.
  var TRAIN = { epochs: 40, hidden: 128, lr: 0.002, l2: 0.0003, dropout: 0.3, batch: 32, seed: 7 };

  function build(tax) {
    var G = tax.groups;
    function cls(ids) {
      return ids.map(function (id, i) { return { id: id, label: G[id].label, color: COLORS[i % COLORS.length], fact: G[id].fact }; });
    }
    var core6 = ['fish', 'marine_mammals', 'mollusks', 'crustaceans', 'cnidarians', 'echinoderms'];
    var l3 = core6.concat(['reptiles', 'birds', 'amphibians', 'worms', 'sponges', 'trash']);
    var l4 = core6.concat(['sponges', 'worms', 'reptiles', 'birds', 'amphibians', 'insects', 'arachnids']);
    var levels = [
      {
        id: 1, key: 'sorter', title: 'Ocean Sorter', short: 'Animal or trash?',
        mission: 'Bubbles the robot is learning to clean the ocean. Can you teach it to tell an ocean animal from ocean trash?',
        learn: ['AI learns from examples.', 'The pictures you choose change what the AI learns.', 'An AI can make mistakes.', 'More pictures is not always better. Good, different pictures are best.'],
        classes: [
          { id: 'animal', label: 'OCEAN ANIMAL', color: COLORS[0], fact: 'Animals are alive. They move, eat, and grow.' },
          { id: 'trash', label: 'OCEAN TRASH', color: COLORS[1], fact: G.trash.fact }],
        classOf: function (im) { return im.habitat === 'OCEAN' ? (im.kind === 'trash' ? 'trash' : 'animal') : null; },
        unsureAllowed: false
      },
      {
        id: 2, key: 'expert', title: 'Ocean Animal Expert', short: 'Six animal groups',
        mission: 'Now Bubbles knows what an animal is. Teach it six big animal groups!',
        learn: ['Dolphins and whales are mammals, not fish.', 'Sharks are fish.', 'Coral and sea anemones are animals, not plants.', 'Sea stars are animals, not fish.'],
        classes: cls(core6),
        classOf: function (im) { return core6.indexOf(im.group) >= 0 ? im.group : null; },
        unsureAllowed: false
      },
      {
        id: 3, key: 'mystery', title: 'Ocean Mystery Challenge', short: 'Tricky pictures',
        mission: 'Mystery time! Some pictures are hard: dark water, hiding animals, and trash that looks alive. New groups join too. The AI can also say UNSURE.',
        learn: ['Some animals are only near the coast or in fresh water.', 'Trash can look like animals, and animals can look like trash.', 'A good AI says UNSURE when it does not know.', 'Insects and spiders are NOT taught here, so the right answer for them is UNSURE.'],
        classes: cls(l3),
        classOf: function (im) { return (im.group === 'insects' || im.group === 'arachnids') ? null : im.group; },
        expectedOf: function (im) { return (im.group === 'insects' || im.group === 'arachnids') ? 'unsure' : im.group; },
        unsureAllowed: true, unsureBelow: 0.55
      },
      {
        id: 4, key: 'lab', title: 'Animal Classification Lab', short: 'Animal family tree',
        optional: true,
        mission: 'Explore the animal family tree. Then teach Bubbles 13 animal groups.',
        learn: ['Animals with a backbone are vertebrates. Animals without a backbone are invertebrates.', 'Crustaceans, insects, and arachnids are all arthropods.', 'These groups are not all the same size or rank.'],
        classes: cls(l4),
        classOf: function (im) { return im.kind === 'trash' ? null : (l4.indexOf(im.group) >= 0 ? im.group : null); },
        unsureAllowed: true, unsureBelow: 0.45
      }
    ];
    levels.forEach(function (L) {
      L.classIds = L.classes.map(function (c) { return c.id; });
      L.cls = {}; L.classes.forEach(function (c) { L.cls[c.id] = c; });
      if (!L.expectedOf) L.expectedOf = L.classOf;
    });
    return {
      levels: levels, train: TRAIN, taxonomy: tax,
      evalSets: [
        { id: 'test', label: 'Fixed test set', note: 'Pictures the AI has never seen. They are never used for training.' },
        { id: 'challenge', label: 'Challenge set', note: 'Extra hard pictures. They are also never used for training.' }
      ],
      trainableSplits: ['train', 'pool'],
      secretSplits: ['validation', 'test', 'challenge'],
      hashDistanceLimit: 8,
      hierarchy: {
        vertebrates: ['fish', 'amphibians', 'reptiles', 'birds', 'marine_mammals'],
        invertebrates: ['mollusks', 'crustaceans', 'insects', 'arachnids', 'cnidarians', 'echinoderms', 'sponges', 'worms'],
        arthropods: ['crustaceans', 'insects', 'arachnids']
      },
      tagNames: {
        transparent: 'see-through objects', camouflage: 'camouflaged animals', low_light: 'dim, dark water', distant: 'far-away objects',
        unusual_angle: 'odd angles', partially_hidden: 'partly hidden objects', similar_shape: 'look-alikes'
      },
      tagImageHint: {
        transparent: 'see-through plastic that lets the water show through',
        camouflage: 'animals whose colors blend into the background',
        low_light: 'pictures taken in dim, dark water',
        distant: 'small, far-away animals or objects',
        unusual_angle: 'pictures from the top, tilted, or upside down',
        partially_hidden: 'pictures where plants or rocks hide part of the object',
        similar_shape: 'pictures of look-alikes, so the AI can compare them'
      }
    };
  }
  return { build: build, TRAIN: TRAIN };
});
