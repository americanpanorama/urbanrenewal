import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';

const TextsStore = {

  data: {
    modal: {
      open: false,
      subject: null
    },
    intro: `
      <p>Renewing Inequality presents a newly comprehensive vantage point on mid-20th century America: the expanding role of the federal government, the development and redevelopment of cities, and the perpetuation of racial and spatial inequalities. It offers the most comprehensive and unified set of national and local data on the federal Urban Renewal program, a World War II-era urban policy that fundamentally reshaped large and small cities well into the 1970s.</p>
      <p>Urban renewal subsidized local government-run programs to acquire and clear tens of thousands of acres of “blighted” land - an administrative term of art that, in practice, disproportionately targeted minority neighborhoods. By the mid-1960s, one analyst estimated that some 66,000 families were being displaced annually through eminent domain, with people of color displaced at rates far higher than their share of the population. Though displaced residents were meant to receive some combination of compensation, relocation assistance, or placement in public housing, these federally guaranteed measures were often too meager, late in coming, or never delivered. In many cases, the program’s local administrators also turned homeowners in to renters without delivering fair market value for seized properties. These thousands of acts of intergenerational wealth theft helped shape today’s profound inequality, a driving force of which are ongoing and growing racial divergences in homeownership rates.</p>
      <p>By the time the program came to an end, the federal government had approved over $13 billion worth of grants to over 1,200 municipalities in support of some 3,200 projects. Never before has the scope of these projects - including estimates of families displaced by race; total land cleared; and amount spent - been compiled, let alone mapped from the national to the local scales. And, while scholars have often written about the program from the perspectives of big cities like Chicago or New York, Renewing Inequality offers a more comprehensive accounting of the program. Indeed, a majority of renewal projects were in cities of 50,000 or fewer residents; and a majority of that figure were in cities of 25,000 or fewer. And, while the scholarly record of renewal would suggest the program’s greatest impact was in the midwest and northeast, our data - drawn from over two decades of quarterly federal reports on all programs - reveals that Southeastern states (Alabama, Florida, Georgia, Kentucky, Mississippi, North Carolina, South Carolina, and Tennessee) pursued more projects than either of those regions. </p>
      <p>Scholars have long noted the racial violence that was often at the center of Urban Renewal projects, but by focusing their studies on larger cities, they have missed the preponderant story of the intimacy of racialized clearance in smaller cities. By enabling users to view both raw displacement figures and displacement in terms of racial demographic data (drawn from the 1960 census), Renewing Inequality makes it possible to pinpoint the municipalities that displaced the highest percentage of their non-white or white populations. </p>
      <h2>Developing New Questions About Urban Renewal</h2>
      <p>Urban Renewal has rightly received a great deal of attention from the public and scholars alike. But the program did far more than displace thousands of Americans. By mandating that local governments enhance their planning capabilities and by detailing how to do so, federal planning grants tied to renewal reshaped not only the capacities of local governments but also their missions. Urban renewal fostered a homogenizing period in urban planning and development, as cities as distinct as New York City and Rome, Georgia replaced “blighted” neighborhoods with megablock developments, highways, and modernist office buildings and parking garages. Yet, because renewal has largely been understood from the perspectives of the New Yorks and not the Romes, the program’s full scope has been hidden from view. </p>
      <p>Renewing Inequality offers a jumping off point for new inquiry, comparisons, and narratives. It makes possible comparative analysis of displacement, funding, and demographic change at the level of municipality, state, region, and nation. While this project points to continuities in urban redevelopment patterns and displacement, it also offers scholars and the public flexible tools to generate more precise questions: How and why did the program grow over time? Where were the most egregious or equitable patterns of displacement and clearance? How did the selection of urban renewal project sites relate to the Home Owners’ Loan Corporation’s “security maps”? </p>
      <p>Two generations of scholars have identified urban renewal as one of the most significant factors in the preservation of racial segregation and inequality. Many of the renewal programs were operated in cooperation with powerful local business interests - real estate lobbies or chambers of commerce - who saw in renewal the opportunity to profit by seizing the homes and properties of residents deemed racially or ethnically incompatible. As one early advocate of “siphoning off [the] slum population” through redevelopment explained, these residents should be relocated to “cheaper areas,” the cleared land should be redeveloped for “recreational purposes,” “higher income groups,” and for “business and industry.” Renewing Inequality reveals the breadth and scope of urban renewal, providing visitors with a new vantage points not only on the most consequential trends in urban redevelopment in the second half of the 20th century, but also a clearer understanding of the relationship between race, wealth, and poverty in America. </p>
    `,
    sources: `
      <h2>A Note on Sources and Methods</h2>
      <p>All data about displacements, housing units razed, and re-use comes from the federal government's <cite>Urban Renewal Project Characteristics</cite> issued quarterly from 1955 to 1966. Those reports contain data about federally funded urban renewal projects in the aggregate and for individual projects. Funding data comes from the</p>
    `,
    burgess: [
      "<p><strong>Inspired by the 1920s-era \"concentric zones theory\" of Ernest W. Burgess, this interactive visualization offers a view of how redlining concentrated populations, and did so along a generally consistent pattern.</strong></p>",
      "<p>An urban sociologist of the extraordinarily influential Chicago School of Sociology, Burgess expounded this theory in a 1925 study <cite>The City</cite>. According to Burgess, every city developed as a series of concentric circles.  Downtown business districts would be surrounded by factory zones.  Factory zones would transition to slums, followed then by progressively more affluent housing for working people and the investor class, before then reaching the final zone, from whence commuters came into the city. As the historian Elaine Lewinnek points out, \"Burgess adapted a half-century of Chicago maps and codified them in a model of abstraction and urban theory that has been called&#8212;with some hyperbole&#8212;'the most famous diagram in social science.'\" (<cite>The Working Man’s Reward: Chicago’s Early Suburbs and The Roots of American Sprawl</cite> (Oxford, 2014), 130.)</p>",
      "<img src='./static/burgess.png' />",
      "<p>In Burgess's model, each ring had cultural and economic features&#8212;features that he explicitly associated with ethnic and racial populations. Recent immigrants and black migrants occupied central slum districts rife with vice dens and run down rooming houses.  Second-generation European immigrants and factory and a shop workers, \"skilled and thrifty,\" lived on the outer edge of the slums and on the inner edge of the ring of well-kept apartment houses and \"workingmen's homes.\" Beyond them was the \"Promised Land\" of residential hotels and single-family homes.  In contrast to the swarthy, congested slums, these were \"bright light areas\" safely protected by restrictive covenants and high price points.</p>",
      "<figure><img src='./static/burgess-chicago.png' /><figcaption>Burgess's theory was drawn from and applied to Chicago.</figcaption></figure>",
      "<p>Burgess's model, in addition to reflecting the homes of real estate investor communities, served as an extension of wider segregationist thinking driving both sociology as a discipline and administrative practice during the progressive era.  Obsession with cities as \"organisms\" of society, they believed in what the sociologist Louis Wirth benignly described as the \"eugenics of the city.\"</p>",
      "<p>Many of the HOLC maps reflected both the categorical impulse and spatial organization of Burgess model with D and C neighborhoods more likely to be located around central business districts and A and B neighborhoods in increasingly suburban peripheries. Many of the commercial maps HOLC colored to create the security maps had concentric circles on them that radiated out from the center of the city (for instance, <a {SLUG:fresno-ca}>Fresno</a>, Tampa, ) .</p>", 

      "<p>The diagram visualizes the relative distribution of HOLC grades in relation to the center of the city. The opacity of the rings reflects the relative density of zoned areas on the map. Hovering over the rings will highlight areas for that grade.</p>",
      "<p>Our adaptation of Burgess diagrams is not meant to resuscitate his discredited theory.  Rather, we aim to show just how profoundly segregationist practices of redlining actually shaped American cities to resemble a roundly discredited social theory.  Segregation was not natural.  Quite the contrary, redlining greatly impeded the natural flows of people and capital.  Through federal action and local manipulation, life was made to imitate art.</p>"
    ],
    citing: `
      <h2>Linking to and Citing</h2>
      <p>The URL for <cite>Renewing Inequality</cite> updates to reflect the current map view, which city or neighborhood or area description is selected, any text that is open, etc. You can use those URLs to link to a particular view.</p>
      <p>You can also use those links for citations. We recommend the following format using the <cite>Chicago Manual of Style</cite>. Note the URL below reflects the current view.<p>
      <p style='margin: 0 25px 25px'>Digital Scholarship Lab, &ldquo;Renewing Inequality,&rdquo; <cite>American Panorama</cite>, ed. Robert K. Nelson and Edward L. Ayers, accessed {THE_DATE}, {THE_URL}.</p>
    `,
    about: `
      <h2>About</h2>
      <p><cite>Renewing Inequality</cite> was developed by a team at the University of Richmond's Digital Scholarship Lab: Brent Cebul, Robert K. Nelson, Justin Madron, and Nathaniel Ayers. Gabriella Schneider, Leah Reistle, Emily Landon, Ashley Flanigan,Nat Berry, Patrick Kliebert, Paige Warner, Lina Tori Jan, Erica Ott, Rebecca Tribble, Lily Calaycay, Barbie Savani, Emily Larrabee, Megan Towey, Anna Ellison, Shayna Webb, Kim D’agostini, Benjamin Barad, Evan McKay, and Bonnie Butler did a massive amount of data entry and georeferenced hundreds of projects.</p>
      <p>The generosity of colleagues has been remarkable. We owe our thanks to Nathan Connolly, LaDale Winling, Andrew Kahrl, Lauren Tilton, and David Hochfelder for extraordinarily helpful feedback about the project. Shannon Marie Lauch, David Schuyler, Marie-Alice L'Heureux, Damon Scott, Elsa Devienne, Elizabeth J. Mueller, Rebecca S. Wingo all shared expertise and resources as we located and mapped urban renewal projects.  Sam Schuth and Kimberly Wolfe ILLed many urban renewal reports.</p>
      <p>The <a href='//mellon.org'>Andrew W. Mellon Foundation</a> provided the DSL generous funding to work on this and the other initial maps of <cite><a href='//dsl.richmond.edu/panorama'>American Panorama</a></cite>.</p>
      <div><a rel='license' href='http://creativecommons.org/licenses/by-nc-sa/4.0/''><img alt='Creative Commons License' src='https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png' /></a><br />This work and its data are licensed under a <a rel='license' href='http://creativecommons.org/licenses/by-nc-sa/4.0/'>Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.</div>
    `
  },

  setShow: function (subject) {
    this.data.modal = {
      open: (subject !== null),
      subject: subject
    };
    this.emit(AppActionTypes.storeChanged);
  },

  getModalContent: function() {
    return (this.data.modal.open) ? this.parseModalCopy(this.data[this.data.modal.subject]) : null;
  },

  getSubject: function () {
    return this.data.modal.subject;
  },

  mainModalIsOpen: function() {
    return this.data.modal.open;
  },

  parseModalCopy (modalCopy) {
    try {

      // replace the date
      const objToday = new Date(),
        months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
      modalCopy = modalCopy.replace('{THE_DATE}', months[objToday.getMonth()] + ' ' + objToday.getDate() + ', ' + objToday.getFullYear());

      // replace the URL
      modalCopy = modalCopy.replace('{THE_URL}', window.location.href);
    } catch (error) {
      console.warn('Error parsing modal copy: ' + error);
      modalCopy = 'Error parsing modal copy.';
    }

    // React requires this format to render a string as HTML,
    // via dangerouslySetInnerHTML.
    return {
      __html: modalCopy
    };
  }

};

// Mixin EventEmitter functionality
Object.assign(TextsStore, EventEmitter.prototype);

// Register callback to handle all updates
AppDispatcher.register((action) => {

  switch (action.type) {

  case AppActionTypes.loadInitialData:
    if (action.hashState.text) {
      TextsStore.setShow(action.hashState.text);
    }
    break;

  case AppActionTypes.onModalClick:
    // toggle of when the same text is requested
    TextsStore.setShow((action.subject !== TextsStore.getSubject()) ? action.subject : null);
    break;

  }
  return true;
});

export default TextsStore;