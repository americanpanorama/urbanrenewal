import * as React from 'react';

import DimensionsStore from '../../stores/DimensionsStore.js';
import CitiesStore from '../../stores/CitiesStore';

export default class NationalStats extends React.Component {
  constructor (props) { super(props); }

  _label(label, percent, x, tb) {
    tb = tb || 'sub';
    if (DimensionsStore.getProjectStatProportionWidth(percent) >= 100) {
      return (
        <text
          x={ x }
          y={ 37 }
          transform='translate(120)'
          className='labelOnBar'
        >
          { Math.round(percent * 100) + '% ' + label }
        </text>
      );
    }

    else if (DimensionsStore.getProjectStatProportionWidth(percent) >= 20) {
      return (
        <g transform={ 'translate(' + (120 + x) + ' 30)'}>
          <text
            x={ 0 }
            y={ 7 }
            className='labelOnBar'
          >
            { Math.round(percent * 100) + '%' }
          </text>
          <line
            x1={ 0 }
            x2={ 0 }
            y1={ (tb == 'super') ? -10 : 10 }
            y2={ (tb == 'super') ? -18 : 18 }
            strokeWidth={1}
            stroke='black'
          /> 
          <text
            x={ 0 }
            y={ (tb == 'super') ? -18.5 : 31.5 }
          >
            { label }
          </text>
        </g>
      );
    }
  }

  render() {
    let houses = (this.props.houses_sub_standard) ?  this.props.houses_sub_standard + this.props.houses_standard : 0,
      acres = 0,

      widths = {
        blighted_residential: DimensionsStore.getProjectStatProportionWidth(this.props.blighted_residential/this.props.total_projects) || 0,
        other_blighted: DimensionsStore.getProjectStatProportionWidth(this.props.other_blighted/this.props.total_projects) || 0,
        predominantly_open: DimensionsStore.getProjectStatProportionWidth(this.props.predominantly_open/this.props.total_projects) || 0,
        open_land: DimensionsStore.getProjectStatProportionWidth(this.props.open_land/this.props.total_projects) || 0,
        disaster_area: DimensionsStore.getProjectStatProportionWidth(this.props.disaster_area/this.props.total_projects) || 0,
        university_or_college_area: DimensionsStore.getProjectStatProportionWidth(this.props.university_or_college_area/this.props.total_projects) || 0,
        familiesOfColor: DimensionsStore.getProjectStatProportionWidth(this.props.nonwhite/(this.props.nonwhite + this.props.whites + this.props.unspecified)) || 0,
        whiteFamilies: DimensionsStore.getProjectStatProportionWidth(this.props.whites/(this.props.nonwhite + this.props.whites + this.props.unspecified)) || 0,
        territoriesFamilies: DimensionsStore.getProjectStatProportionWidth(this.props.unspecified/(this.props.nonwhite + this.props.whites + this.props.unspecified)) || 0,
        substandard: DimensionsStore.getProjectStatProportionWidth(this.props.houses_sub_standard/(this.props.houses_sub_standard + this.props.houses_standard)) || 0,
        standard: DimensionsStore.getProjectStatProportionWidth(this.props.houses_standard/(this.props.houses_sub_standard + this.props.houses_standard)) || 0,
        residential: DimensionsStore.getProjectStatProportionWidth(this.props.reuse_residential/acres) || 0,
        commercial: DimensionsStore.getProjectStatProportionWidth(this.props.reuse_commercial/acres) || 0,
        industrial: DimensionsStore.getProjectStatProportionWidth(this.props.reuse_industrial/acres) || 0,
        public: DimensionsStore.getProjectStatProportionWidth(this.props.reuse_public/acres) || 0
      };

    return (
      <div className='projectStats'>
        <h2>{ 'NATIONWIDE, ' + ((this.props.selectedYear) ? this.props.selectedYear : '1950-1966') }</h2>

        <div className='context'>
          { (this.props.selectedYear == 1950) ? 
            <div>
              <p>The Housing Act of 1949 updated and expanded two New Deal era Housing Acts (1934 and 1937). While those Acts had focused primarily on stimulating private housing markets and constructing public housing projects, the 1949 Act included a new priority. Title I of the Housing Act of 1949 enabled the federal government, for the first time, to explicitly aid cities in their efforts to clear slums and redevelop areas of “blight.” The program overwhelmingly emphasized new construction rather than the rehabilitation of older buildings. While the slum clearance aspect of the legislation was novel, the Act stipulated that no federal funds, either grants or loans, would be delivered to a municipality unless the local authorities demonstrated that plans were in place to house displaced residents in safe and sanitary housing at rental prices within their means. Title III of the Housing Act of 1949 set a goal of constructing more than 810,000 units of public housing over a six-year period. These new housing projects were not required to have any formal connection to redevelopment projects.</p> 
              <p>In 1950 the first federally funded urban redevelopment projects began to be executed. All of these early projects were in large eastern and midwestern cities: <span onClick={ this.props.onProjectClick } id={2468}>Lake Meadows</span> in Chicago, <span onClick={ this.props.onProjectClick } id={2740}>Gratiot</span> in Detroit, <span onClick={ this.props.onProjectClick } id={1355}>East Poplar</span> in Philadelphia, and <span onClick={ this.props.onProjectClick } id={781}>Broadway</span> and <span onClick={ this.props.onProjectClick } id={192}>Waverly</span> in Baltimore.</p>

            </div> : 
            (this.props.selectedYear == 1951) ? 
            <div>
              <p>Slum clearance projects were already underway in many cities prior to the federal Housing Act of 1949. During the New Deal, local governments often used federally subsidized labor programs, particularly through the Works Progress Administration, to clear outmoded or derelict buildings and factories. By 1938, New York City Mayor Fiorello LaGuardia believed his administration had torn down or gutted nearly 9,000 buildings, often with federally-subsidized labor. In Cleveland, between 1932 and 1934 alone, the city used federal subsidies to raze more than 3,000 structures. In Philadelphia, meanwhile, New Deal support for clearance contributed to the demolition of 8,328 structures, releasing land for redevelopment which the city estimated to be worth $11.5 million. Boston, Detroit, and Pittsburgh also accelerated their clearance efforts during the 1930s. Nationally, between 1937 and 1940, the New Deal subsidized over 370 clearance and housing projects at a cost of roughly $540 million. And, as in urban renewal, these projects were not solely in larger cities. Small municipalities like Enid, Oklahoma, Lackawanna, New York, and Evansville, Indiana all used New Deal subsidies to clear slums and, in some, construct public housing projects.</p>
              <p>Following World War II, a number of cities and states worked to formalize these processes. Illinois's Blighted Areas Redevelopment Act of 1947, for instance, anticipated and arguably served as a model for federal urban redevelopment legislation. It authorized cities in the state to create commissions empowered with the authority to clear slums by seizing property through eminent domain. Chicago's <span onClick={ this.props.onProjectClick } id={2468}>Lake Meadows</span> project was initiated before passage of the Housing Act of 1949, but the city quickly applied for and was awarded nearly $10 million in federal funding. The clearance of the area displaced more that 3,400 African American families and nearly 1,000 individual adults. Many of those displaced moved south into the Hyde Park neighborhood, helping prompt <span onClick={ this.props.onProjectClick } id={2466}>another urban renewal project</span> several years later that would displace a larger number of families than any other project in the city and the fifth most of any in the country.</p>
              <p className='sources'>Sources: Mabel Walker, <cite>Urban Blight and Slums: Economic and Legal Factors in their Origin, Reclamation, and Prevention</cite> (Cambridge: Harvard University Press, 1938); Robert D. Leighninger, Jr., <cite>Long-Range Public Investment: The Forgotten Legacy of the New Deal</cite> (Columbia, SC: University of South Carolina Press, 2007), 121-7; Arnold R. Hirsch, <cite>Making the Second Ghetto: Race and Housing in Chicago, 1940-1960</cite> (New York: Cambridge University Press, 1983).</p>
            </div> : 
            (this.props.selectedYear == 1952) ? 
            <div>
              <p>Norfolk's aptly named <span onClick={ this.props.onProjectClick } id={1616}>"Project No. 1"</span> was the first large-scale urban redevelopment project executed with federal funding. BThanks largely to Norfolk’s status as a major hub of the U.S. Navy, Norfolk often led the way in federal-local cooperation during and after the war. Norfolk won significant aid from a number of civilian and military agencies, with housing dominating the agenda. In the 1940s, Norfolk, along with its neighbors Hampton Roads and Newport News, spent $127 million on public housing (most of which was delivered by the federal government), and, as they did so, the pattern of development followed national trends: the cities concentrated African Americans in poorly constructed public units. Many of the black residents who remained in their neighborhoods would be forced out by Project Number One. Located on 70 acres just north of downtown, the project displaced nearly 3,000 families, about twice the number of the next largest individual projects that would be executed in a comparably sized city.</p>
              <p>If exceptional in the number displaced, who they were was typical: all but a tiny number of were African American. Many families would be relocated to four new public housing projects. The 800 single individuals who were displaced did not have that option as public housing was limited to families, and most of them didn't have enough income to afford private housing.</p>
              <div><img src='static/195112PROJECTONE00066.jpg' style={{ width: DimensionsStore.getSidebarStyle().width * 0.9 - 40, paddingLeft: DimensionsStore.getSidebarStyle().width * 0.05 }} /></div>
              <p className='sources'>Sources: "Federal Slum Clearance Gets Its First Full Scale Tryout in Norfolk, Va.," <cite>Architectural Forum</cite> (May 1950): 130-137); James T. Sparrow, “A Nation in Motion: Norfolk, the Pentagon, and the Nationalization of the Metropolitan South, 1941-1953,” in <cite>The Myth of Southern Exceptionalism</cite>, ed. Matthew D. Lassiter and Joseph Crespino (New York: Oxford University Press, 2010), 172-74; <a href='https://nrha.photoshelter.com/gallery-image/Historical/G0000sjxf1Fx4fek/I000089JnCn44Fdc' target='_blank'>"1951 December..Redevelopment..Project#1 (UR1-1)..Demolition Ceremony," Norfolk Redevelopment and Housing Authority</a>.</p>
            </div> : 
            (this.props.selectedYear == 1953) ? 
            <div>
              <p>The prospect of slum clearance and new public housing projects was met with fury and opportunism by a shadowy figure in urban life: the slumlord. As African Americans arrived in northern cities to take advantage of World War II-era employment, most struggled to find good housing because of redlining, shortages, and segregation. These forces meant that black residents were packed into increasingly overcrowded neighborhoods. For unscrupulous building owners—slumlords—this artificially captured market offered a number of ways to profit. In <span onClick={ this.props.onCityClicked } id={ CitiesStore.getCityIdFromSlug('detroitMI')}>Detroit</span>, landlord William Burton owned dozens of rundown apartment buildings and charged African American residents $100 per month rent—the average rent in the city was $50. Between January and August of 1953 alone, Burton evicted sixty-four families from his surely seizing security deposits along the way. In <span onClick={ this.props.onCityClicked } id={ CitiesStore.getCityIdFromSlug('clevelandOH')}>Cleveland</span>, one of the most prolific slumlords was Benjamin Frankel. Frankel owned scores of slum properties in the city’s renewal-targeted east side neighborhood of Cedar-Central, and, as the city’s African American newspaper, the <cite>Call and Post</cite> reported, his slum profits encouraged a “one-man war against Urban Redevelopment.” To protect the profits derived from segregation, Frankel even funded resident meetings to organize against the program. Eventually, though, he sold out, first demanding the breathtaking sum of $500,000 for some 37 dilapidated houses that, according to one report, housed as many as 200 families, or roughly 20 persons per home. The city balked at his initial demand but, in 1955, it finally agreed to pay Frankel $300,000 for the lot. Evicted families faced greater crowding, while slumlords like Frankel extracted another bit of profit from the distorted markets segregation and renewal combined to make.</p>
              <p className='sources'>Sources: "Frankel Turns Over Area B Homes to City,"" <cite>Call and Post</cite>, May 14, 1955.</p>
            </div> : 
            (this.props.selectedYear == 1954) ? 
            <div>
              <p>The 1954 Housing Act greatly intensified federally-funded urban renewal initiatives that had been kickstarted by the 1949 Housing Act. The 1954 enabled cities to use some of the land cleared with federal funding for commercial and industrial in addition to residential purposes and to propose rehabilitation and conservation projects to improve rather than clear residential neighborhoods. In short, cities could now apply for funding to seize people's property for purposes other than improving their living situations. Scores of federally-funded urban renewal projects razed neighborhoods and displaced thousands of people. </p>
              <p><span onClick={ this.props.onCityClicked } id={ CitiesStore.getCityIdFromSlug('newyorkNY')}>New York</span> early sought urban renewal funds, not just because of its size but because of the aggressive slum clearing policies of New York urban planner Robert Moses.</p>
            </div> : 
            (this.props.selectedYear == 1955) ? 
            <div>
              <p>Across the industrial centers of the North, African Americans arrived in droves during the Second World War and postwar years. While they surely sought to escape the Jim Crow South, they also came in search of the industrial employment that was jumpstarted by war. Indeed, more than one million of the ten million African Americans living in the South in 1940 would move north or west during the Second World War. Between 1940 and 1950, Detroit’s black population doubled from 149,119 (9.2% of the total population) to 300,506 in 1950 (16.2% of the total). By 1960, Detroit’s 483,229 African American residents comprised nearly 30 percent of the city’s population. By that year, a majority of the nation’s African American population lived in cities, the preponderance of which were north of the Mason-Dixon Line.</p>
              <p>Detroit was typical in other ways, too, particularly the city’s chronic housing shortage for African American residents. In the 1940s, for instance, just 1,500 of the 186,000 single family homes were in neighborhoods available to African Americans. Similarly, between 1945 and 1952 in Cleveland’s Cuyahoga County, 69,000 new units of housing were constructed, but just a paltry 200 units were in areas available to black customers.</p>
              <p>As a result of the crisis conditions facing black renters and potential home buyers, many looked with great optimism to the Housing Act of 1949’s promise of improved housing for all Americans. As Cleveland’s major daily black newspaper, the <cite>Call and Post</cite>, put it in 1955, the “nation’s poorly-housed Negro population stands Number One on the list of beneficiaries” of urban renewal. The paper quoted a federal report that argued that renewal would deliver “substantial improvements in the housing conditions of minority groups.” Community leader and Unitarian minister Jesse Cavileer hoped that renewal might enable black residents to improve their housing while also maintaining the integrity of their neighborhoods. As he put it, “slums are an eyesore and a disgrace to the health, the welfare, and the morale of the city. They must be completely torn down.” Cavileer reminded his congregants that by 1955, a further 86,000 units of private housing had been constructed in the Cleveland area, “but less than 800 of these have been for occupancy by Negroes.” The Hough Area Council, an assembly of minority homeowners and renters in the increasingly crowded black community of Hough, enthusiastically supported renewal. On a Friday afternoon in March 1955, hundreds of black residents of the <span onClick={ this.props.onProjectClick } id={3024}>Gladstone</span> neighborhood cheered as the city’s renewal department bulldozed its first house.</p>
              <p className='sources'>Sources: Thomas J. Sugrue, <cite>Origins of the Urban Crisis: Race and Inequality in Postwar Detroit</cite> (Princeton, N.J. : Princeton University Press, 1996), 43-53; Daniel R. Kerr, <cite>Derelict Paradise: Homelessness and Urban Development in Cleveland, Ohio</cite> (Amherst: University of Massachusetts Press, 2011), 124-25.</p>
            </div> : 
            (this.props.selectedYear == 1956) ? 
              <div>
                <p>The 1956 Federal-Aid Highway Act became another tool of slum clearance. Over the subsequent decade, many poorer neighborhoods, particularly African American neighborhoods, were destroyed for highway construction, and highways were carefully position to buttress segregation and insulate white and black neighborhoods from one another. Urban planners viewed highways as essential arteries that would enable middle-class white families to live in the suburbs but still work and shop in downtown central business districts.</p>
                <p>The statistics on displacments include those funded through the urban renewal housing acts of the 1940s and 1950s and do not include that that resulted from highway construction. They thus substantially undercount how many people were displaced through federal programs in mid-century America.</p>
              </div> : 
            (this.props.selectedYear == 1957) ? 
              <div>
                <p>Initially, some African Americans welcomed urban renewal as an opportunity to improve housing in black communities and perhaps even begin to desegregate some cities. But for many those hopes quickly faded as they found themselves displaced from their homes with no other options than to move to other segregated neighborhoods that were no or little better. At a 1957 Senate hearing, the executive secretary of the Pittsburgh branch of the NAACP condemned the execution of the city's <span onClick={ this.props.onProjectClick } id={1417}>Lower Hill project</span>. "As a result of slum clearance in the Lower Hill," she reported, "other areas, such as the Upper Hill and the Homewood-Brushton area are now experiencing overcrowding, exploitation by real estate dealers, and transference of some of the same conditions responsible for deterioration of the Lower Hill District."</p>
                <p>Ultimately, nearly 1,900 families, two-thirds of them of color, were displaced by the Lower Hill project. <span onClick={ this.props.onProjectClick } id={1416}>Homewood</span> became an urban renewal site ten years later, one that did not involve displacements. The community of the Upper Hill successfully resisted urban renewal from extending beyond Lower Hill.</p>
                <div><img src='static/lowerhillpittsburgh.jpg' style={{ width: DimensionsStore.getSidebarStyle().width * 0.9 - 40, paddingLeft: DimensionsStore.getSidebarStyle().width * 0.05 }} /></div>
                <p className='sources'>Sources: <cite>Pittsburgh Courier</cite>, December 28, 1957; <a href='http://www.pittsburghmagazine.com/Pittsburgh-Magazine/December-2013/The-Way-We-Were/' target='_blank'>The Way We Were: 150 Years of Pittsburg History</a>.</p>
              </div> : 
            (this.props.selectedYear == 1958) ? 
              <div>
                <p>The map for 1958 evidences the expansion of urban renewal. Nearly a hundred cities and towns that had not received urban renewal grants launch projects involving displacements that year. These weren't large cities but instead mid-sized and small cities and towns. Bessemer, Alabama's <span onClick={ this.props.onProjectClick } id={1690}>Downtown 19th Street Project</span> would displace nearly 400 families; Tacoma, Washington's <span onClick={ this.props.onProjectClick } id={4062}>Center Street Project</span> nearly 100; and Springfield, Massachusetts's <span onClick={ this.props.onProjectClick } id={334}>North End Project</span> more than a thousand, all launched in 1958.</p>
              </div> : 
            (this.props.selectedYear == 1959) ? 
              <div>
                <p>Scholars have tended to emphasize the momentous 1954 amendments to the 1949 Housing Act, but the 1959 amendments set in motion significant new patterns in renewal as well. In 1959, Congress made universities eligible to receive renewal funds without having to include plans for housing. Two years later, the same opportunity was extended to hospitals. By 1964, 154 projects were underway involving college and university or hospital campus developments. These included medical facilities in cities of all sizes including Detroit's <span onClick={ this.props.onProjectClick } id={2744}>Medical Center</span>, Oklahoma City's <span onClick={ this.props.onProjectClick } id={3573}>University Medical Center</span>, Tuscaloosa's <span onClick={ this.props.onProjectClick } id={1807}>Druid City Hospital</span>, and Evansville's <span onClick={ this.props.onProjectClick } id={2582}>Welborn Medical Center</span>. </p>
                <p>The <span onClick={ this.props.onProjectClick } id={1881}>Medical College of Georgia</span> twice expanded through two urban renewal projects. Grady Abrams was one of the people displaced through that expansion. Reflecting decades later, he readily acknowledged that "my surroundings improved tremendously" as he relocated from his childhood home as a 21-year-old young man. But displacement took a profound emotional toll: "It is one thing to leave your home, your neighborhood on your own, to be forced out is a different manner. It takes on a different meaning. It was, to me, the closest thing to death I can think of. In fact, my neighbors and I lost relationships forever. There is nothing of the past now in Five Points that I can show my grandchildren and great grandchildren that was part of my past. Nothing at all."</p>
                {/* JSX Comment <p>In Chicago, in fact, the University of Chicago used urban renewal as part of an effort to exclude African Americans from the neighborhood of <span onClick={ this.props.onProjectClick } id={2466}>Hyde Park</span> and to construct a barrier around the campus. As they contemplated the need to protect the campus from African American incursions, the University of Chicago's board of trustees took a bus tour through nearby black neighborhoods. Robert Maynard Hutchins, Chicago's Chancellor and President, hand wrote a short verse explaining the rationale behind seizing and razing local properties: "Our neighborhood, once blossomed like the lily. / Just seven coons with seven kids could knock our program silly."In part thanks to its access to federal urban renewal funds, the University of Chicago expanded from just 7 acres to more than 100, carving out a massive campus within the predominantly black neighborhoods on the south side of Chicago.</p> */}
                <p className='sources'>Sources: Guian A. McKee, "The Hospital in an Ethnic Enclave: Tufts-New England Medical Center, Boston's Chinatown, and the Urban Political Economy of Health Care," <cite>Journal of Urban History</cite> 42 (March 2016): 259-283; Grady Abrams, "Mixed Emotions about Urban Renewal" in <cite>The Evolution of a Negro Into an Integrated Society: Opinion Editorials, Columns, Letters to the Editor, Business and Personal Letters, Poems</cite> (Xlibris: 2011), 283-285.</p>
              </div> : 
            (this.props.selectedYear == 1960) ? 
              <div>
                <p>While the map shows how urban renewal affected dozens of small localities that we typically don't think of as urban, it's harder to see the inverse: the few large cities that didn't seek federal urban renewal funds.</p>
                <p>Neither of the largest two cities in Texas, Houston and Dallas—respectively, the seventh and thirteenth largest cities in the US in 1960—applied for urban renewal funds. Before cities could apply for urban renewal funding, state legislatures needed to pass enabling legislation granting them the authority to seize property through eminent domain. The Texas legislature didn't pass such legislation until 1957, and that legislation required the passage of a citywide referendum before any locality could apply for urban renewal funding. In Dallas, the city council opted not to put a referendum on the ballot after a contentious public debate where opponents characterized the use of eminent domain and federal funding as "creeping socialism." In Houston, the city refused to enact zoning and code regulations that were required for eligibility. Rather than redevelop their cities from the center out, Dallas and Houston linked outward sprawl with the conservative political values of limited government.</p>
                <p>The largest urban renewal project in Texas was located in the far west of the state in the comparatively small city of Lubbock. There the city's <span onClick={ this.props.onProjectClick } id={3660}>Coronado project</span> displaced nearly 1,300 African American families.</p>
                <p className='sources'>Sources: Robert B. Fairbanks "The Texas Exception: San Antonio and Urban Renewal, 1949-1965," <cite>Journal of Planning History</cite> 1 (May 2002): 181-196.</p>
              </div> :
            (this.props.selectedYear == 1961) ? 
              <div>
                <p>Published in 1961, Jane Jacobs's <cite>The Death and Life of Great American Cities</cite> offered a damning critique of urban renewal in large American cities. While much of her criticism stemmed from what she considered the banal sterility of planned modernist urban spaces, she also condemned the human toil urban renewal took upon the communities it targeted. "People who get marked with the planners' hex signs are pushed about, expropriated, and uprooted much as if they were the subjects of a conquering power .... Whole communities are torn apart and sown to the winds, with a reaping of cynicism, resentment and despair."</p>
                <p>While the power and eloquence of Jacobs's indictment had a long impact on urbanism and planning, more immediately significant was the grassroots resistance to urban renewal mounted in cities throughout the United States. "You have depressed the values of our property by calling it blighted," charged a Los Angeles activist resisting the <span onClick={ this.props.onProjectClick } id={3826}>Temple</span> and <span onClick={ this.props.onProjectClick } id={3821}>Bunker Hill</span> projects. "They call us 'land-grabbers' without really knowing why," retorted a local planning official. "Perhaps they have a point, but under the concept of urban renewal, so do we." Nearly 3,000 families were displaced by those two projects.</p>
                <p className='sources'>Sources: Jane Jacobs, <cite>The Death and Life of Great American Cities</cite> (1961; New York: Modern Library, 1993), 7; <cite>Los Angeles Times</cite>, September 3, 1962.</p>
              </div> :
            (this.props.selectedYear == 1962) ? 
              <div>
                <p>Despite shifting the program’s main focus away from public housing, the 1954 amendments to the 1949 Housing Act did include funds for conservation, rehabilitation, and the "voluntary repair of existing buildings." By the early 1960s, in response to a groundswell of interest, the Urban Renewal Administration circulated a guide, <cite>Historic Preservation Through Urban Renewal</cite>, which detailed how interested communities could use renewal funds to preserve historic areas of cities. In New York City, for instance, fourteen neighborhoods used program funds to conserve the historic character of their homes—using federal funds to accelerate the first wave of gentrification in the historic brownstone neighborhoods of Brooklyn. In Brooklyn Heights, middle class white residents especially mobilized against the city’s original plans for the massive <span onClick={ this.props.onProjectClick } id={529}>Cadman Plaza project</span>, which, as originally designed, might have destroyed considerable portions of the Heights. Instead, armed with the imprimatur of renewal’s emphasis on preservation, middle class residents’ activism led the city in 1962 to create a Landmarks Preservation Commission with the power to place landmark status on buildings and neighborhoods. In 1965, Brooklyn Heights became the city’s first designated historic district, and the city’s plans for Cadman Plaza (and particularly its plans for low income housing) were adjusted accordingly, preserving much of the historic neighborhood of Brooklyn Heights, today one of the most expensive and thoroughly gentrified in all of New York.</p>
                <p>The increasing number of awards by the federal government for "Code Enforcement" projects also reflected the gradual move away from demolition. Rather than raze whole neighborhoods, code enforcement was used to force owners to make improvements to bring houses and dwellings into compliance with building codes, or alternatively to sell. While coercive, code enforcement was less destructive.</p>
              </div> :
            (this.props.selectedYear == 1963) ? 
              <div>
                <p>More than 550 localities appear on the map or chart for 1963, a number that underscores how federal urban renewal efforts effected towns and mid-sized cities across the U.S. and not just the large cities of the northeast and midwest. Nearly a quarter of them had populations of 10,000 or less, another quarter 10,000 to 25,000.</p>
                <p>The absolute number of displacements in many of these towns seems comparatively small, but given their size they often impacted a larger proportion of these localities' citizens. Two or three percent of the citizens of Nanticoke, Pennsylvania, population 15,601 in 1960, Martins Ferry, Ohio, 11,919, and Demopolis, Alabama, 7,377, were displaced by the <span onClick={ this.props.onProjectClick } id={1322}>Market-Broadway project</span>, <span onClick={ this.props.onProjectClick } id={3101}>Hanover Street project</span>, and <span onClick={ this.props.onCityClicked } id={ CitiesStore.getCityIdFromSlug('demopolisAL')}>the Strawberry and Arch Street projects</span>, respectively. While these projects were smaller than many in large cities, more often than not they too disproportionately displaced families of color. People of color were less than 3% of the population of Martins Ferry but 50% of those displaced; they were 50% of the population of Demopolis but 89% of the displaced.</p> 
              </div> : 
            (this.props.selectedYear == 1964) ? 
              <div>
                <p>In 1964 the <cite>Journal of Higher Education</cite> featured a short article aimed at university administrators advocating that they partner with local city governments to win urban renewal contracts that to expand their campuses by clearing "adjoining slum areas" so that they could "purchase cleared land within the project from the local urban renewal agency for considerably less than it could buy the same land with buildings on it." Urban renewal thus subsidized the expansion of universities and colleges at the expense of low-income families who lived near their campuses.</p>
                <p>One of every twenty federal projects in 1964 was awarded under a section of the Housing Act of 1959 that made universities and colleges eligible to apply for urban renewal projects. The 1959 amendment had been made at the urging of the president of the University of Chicago, which had long been involved in a series of urban renewal projects between the university and the African American neighborhoods on Chicago's South Side. A number of colleges took advantage of this program. A few examples: the <span onClick={ this.props.onProjectClick } id={3040}>Ohio State University North</span> project displaced 73 families to expand the university. About 150 families were moved through a series of <span onClick={ this.props.onProjectClick } id={802}>University of Maryland, Baltimore projects</span>.  Yale University received funding thorugh the <span onClick={ this.props.onProjectClick } id={76}>Dwight project</span>. Duquesne University in Pittsburgh expanded through the <span onClick={ this.props.onProjectClick } id={1411}>Bluff Street project</span>. The former displaced 50 families, the latter more than 400.</p> 
                <p className='sources'>Sources: Kenneth H. Ashworth, "Urban Renewal and the University: A Tool for Campus Expansion and Neighborhood Improvement," <cite>Journal of Higher Education</cite> 35 (December 1964): 495-496.</p>
              </div> : 
            (this.props.selectedYear == 1965) ? 
              <div>
                <p>"The overriding issue is whether we are aiming to feather the nests of entrepreneurs or to build homes for the forgotten familes," urbanist Charles Abrams wrote in a 1965 study of urban renewal. What had begun in 1949 as a program specifically aimed at moving people from "substandard," "blighted" housing into better accommodations had evolved through the 1954 amendments into a program that often used federal funds to destroy neighborhoods and communities for commercial ventures aimed at revitalizing downtowns. "As the situation stood in 1965," Abrams lamented, "nest-feathering was in the ascendant, while the social purpose was being moved to the background."</p>
                <p>The dozens of projects all named "Central Business District" is one indication of how much urban renewal was used for ends other than improving the housing condition of the poor. A few examples of "Central Business District" projects can be found in <span onClick={ this.props.onProjectClick } id={2729}>Detroit</span>, <span onClick={ this.props.onProjectClick } id={3570}>Oklahoma City</span>, <span onClick={ this.props.onProjectClick } id={3004}>Cincinnati</span>, <span onClick={ this.props.onProjectClick } id={631}>Rochester</span> and <span onClick={ this.props.onProjectClick } id={831}>Salisbury, Maryland</span>.</p> 
                <p className='sources'>Sources: Charles Abrams, <cite>The City Is the Frontier</cite> (New York: Harper & Row, 1965), 238.</p>
              </div> :
            (this.props.selectedYear == 1966) ? 
              <div>
                <p>In 1966, New Haven, Connecticut’s Hill Neighborhood Union (HNU) established a “Freedom School” and organized rent strikes. A resident and member of the HNU described the group’s purpose. The city administration created its own "citizens committees" to rubber stamp its urban renewal project plans, so “Everything they do we want to know, and we want to be a part of it.” This spirit of democratic participation had, in many ways, been inspired by residents’ frustration with being similarly excluded from local War on Poverty program decisions—a federal program very clearly meant to benefit them and their neighborhoods. Beginning in 1966, and in partnership with Yale undergraduate members of Students for a Democratic Society and a multiracial coalition of residents, the HNU protested and disrupted New Haven’s mandated citizen hearing sessions—the sessions designed to create the appearance of citizen involvement in and approval of renewal plans. While their organizing ultimately failed to halt the city’s prosecution of the <span onClick={ this.props.onProjectClick } id={79}>Hill renewal project</span>, these citizens eventually seized control of the city’s Model City funding, a later initiative of the War on Poverty, and used the funds to make critical improvements to what remained of their neighborhood.</p>
              </div> : 
            (!this.props.selectedYear) ? 
              <div>
                <p>The map and charts here show the number of families that cities reported displacing through federally-funded urban renewal programs between 1955 and 1966. The urban renewal projects that resulted in displacements were typically aimed at "slum clearance": using eminent domain to acquire private homes that were usually deemed sub-standard, razing those houses, and redeveloping the land for new, sometimes public housing, more often private, or for other purposes like the development of department stores or office buildings.</p>
                <div onClick={this.props.toggleIntro}><img src='static/charleston_triangle.jpg' style={{ width: DimensionsStore.getSidebarStyle().width * 0.9 - 40, paddingLeft: DimensionsStore.getSidebarStyle().width * 0.05 , cursor: 'pointer' }} /></div>
                <p className='caption' onClick={this.props.toggleIntro}>"The People & the Program" provides a richer introduction to the complex history of urban renewal and its effect on hundreds of thousands of people</p>
                <p>A third of a million families is a stunning number, but it only represents a part of the toll that the "culture of clearance" took in mid-century cities (to borrow a phrase from historian Francesca Russello Ammon). It does not include numbers between 1967 and 1974 when those were not collected and published by the federal government. It does not include the massive number of single adults displaced—often vulnerable populations like gay men—who as single adults were not eligible for relocation assistance. It does not include displacements through state- rather than federally-funded projects. And it does not include displacements resulting from federally-funded interstate or public housing construction—programs related to but distinct from the urban renewal programs we map here.</p>
                <p>Still, these visualizations do convey much about the broad reach and tremendous impact of urban renewal programs that in a dozen years subsidized the displacements of people in over six hundred cities and towns, not just metropolises like <span onClick={ this.props.onCityClicked } id={ CitiesStore.getCityIdFromSlug('newyorkNY')}>New York</span>, <span onClick={ this.props.onCityClicked } id={ CitiesStore.getCityIdFromSlug('chicagoIL')}>Chicago</span>, and <span onClick={ this.props.onCityClicked } id={ CitiesStore.getCityIdFromSlug('philadelphiaPA')}>Philadelphia</span>, but mid-sized cities like <span onClick={ this.props.onCityClicked } id={ CitiesStore.getCityIdFromSlug('norfolkVA')}>Norfolk</span>, <span onClick={ this.props.onCityClicked } id={ CitiesStore.getCityIdFromSlug('littlerockAR')}>Little Rock</span>, and <span onClick={ this.props.onCityClicked } id={ CitiesStore.getCityIdFromSlug('newhavenCT')}>New Haven</span>, as well as small cities like <span onClick={ this.props.onCityClicked } id={ CitiesStore.getCityIdFromSlug('jasperAL')}>Jasper, Alabama</span>; <span onClick={ this.props.onCityClicked } id={ CitiesStore.getCityIdFromSlug('lewisboroNY')}>Lewisboro, New York</span>; and <span onClick={ this.props.onCityClicked } id={ CitiesStore.getCityIdFromSlug('coosbayOR')}>Coos Bay, Oregon</span>. They also show how displacements had a much bigger effect upon communities of color. While some projects did help improve the quality of housing for many families, for others it destroyed tight-knit communities and did not provide the dislocated adequate financial or logistical assistance to smoothly relocate to other already crowded segregated neighborhoods.</p>
                <p>Hover over the circles representing cities to inspect them and click to select and zoom to them.</p>
              </div> : ''
          }
        </div>



        { (false && this.props.total_projects > 0) ?
          <svg
            { ...DimensionsStore.getProjectStatsOverallDimensions() }
            className='projectStat'
          >
            <g transform='translate(50)'>

              <text 
                x={50}
                y={25}
                className='stat'
              >
                {Math.round(this.props.total_projects).toLocaleString()}
              </text>
              <text 
                x={50}
                y={45}
                className='statLabel'
              >
                projects
              </text>

            {/* families of color */}
              <rect
                width={ widths.blighted_residential }
                height={20}
                x={0}
                y={20}
                fill='#7b7464'
                transform='translate(120)'
              />
              { this._label('blighted residential', this.props.blighted_residential/this.props.total_projects, widths.blighted_residential / 2)}

              <rect
                width={ widths.other_blighted }
                height={20}
                x={ widths.blighted_residential }
                y={20}
                fill='#79a4a7'
                transform='translate(120)'
              />
              { this._label('other blighted', this.props.other_blighted/this.props.total_projects, widths.blighted_residential + widths.other_blighted / 2)}

              <rect
                width={ widths.predominantly_open }
                height={20}
                x={ widths.blighted_residential + widths.other_blighted }
                y={20}
                fill='#ff8b3f'
                transform='translate(120)'
              />
              { this._label('other blighted', this.props.predominantly_open/this.props.total_projects, widths.blighted_residential + widths.other_blighted + widths.predominantly_open / 2)}

              <rect
                width={ widths.open_land }
                height={20}
                x={ widths.blighted_residential + widths.other_blighted + widths.predominantly_open}
                y={20}
                fill='#f4f134'
                transform='translate(120)'
              />
              { this._label('open land', this.props.open_land/this.props.total_projects, widths.blighted_residential + widths.other_blighted + widths.predominantly_open + widths.open_land / 2)}

              <rect
                width={ widths.disaster_area }
                height={20}
                x={ widths.blighted_residential + widths.other_blighted + widths.predominantly_open + widths.open_land }
                y={20}
                fill='#06a2e2'
                transform='translate(120)'
              />
              { this._label('disaster area', this.props.disaster_area/this.props.total_projects, widths.blighted_residential + widths.other_blighted + widths.predominantly_open + widths.open_land + widths.disaster_area / 2)}

              <rect
                width={ widths.university_or_college_area }
                height={20}
                x={ widths.blighted_residential + widths.other_blighted + widths.predominantly_open + widths.open_land + widths.disaster_area }
                y={20}
                fill='#fe5a3c'
                transform='translate(120)'
              />
              { this._label('other blighted', this.props.university_or_college_area/this.props.total_projects, widths.blighted_residential + widths.other_blighted + widths.predominantly_open + widths.open_land + widths.disaster_area + widths.university_or_college_area / 2)}
            
            </g>
          </svg> : ''
        }

        { (false && this.props.totalFamilies > 0) ?
          <svg
            { ...DimensionsStore.getProjectStatsOverallDimensions() }
            className='projectStat'
          >
            <g transform='translate(50)'>

              <text 
                x={50}
                y={25}
                className='stat'
              >
                {Math.round(this.props.totalFamilies).toLocaleString()}
              </text>
              <text 
                x={50}
                y={45}
                className='statLabel'
              >
                families displaced
              </text>

            {/* families of color */}
              <rect
                width={ widths.familiesOfColor }
                height={20}
                x={0}
                y={20}
                fill='#a387be'
                transform='translate(120)'
              />
              { this._label('of color', this.props.nonwhite/(this.props.nonwhite + this.props.whites + this.props.unspecified), widths.familiesOfColor / 2)}

              <rect
                width={ widths.whiteFamilies }
                height={20}
                x={ widths.familiesOfColor }
                y={20}
                fill='#2ca02c'
                transform='translate(120)'
              />
              { this._label('white', this.props.whites/(this.props.nonwhite + this.props.whites + this.props.unspecified), widths.familiesOfColor + widths.whiteFamilies / 2) }

              <rect
                width={ widths.territoriesFamilies }
                height={20}
                x={ widths.familiesOfColor + widths.whiteFamilies }
                y={20}
                fill='#E18942'
                transform='translate(120)'
              />
              { this._label('unspecified', this.props.unspecified/(this.props.nonwhite + this.props.whites + this.props.unspecified), widths.familiesOfColor + widths.whiteFamilies + widths.territoriesFamilies / 2) }
            </g>
          </svg> : ''
        }

        { (false && houses > 0) ?
          <svg
            { ...DimensionsStore.getProjectStatsOverallDimensions() }
            className='projectStat'
          >
            <g transform='translate(50)'>
              <text 
                x={50}
                y={25}
                className='stat'
              >
                { Math.round(houses).toLocaleString() }
              </text>
              <text 
                x={50}
                y={45}
                className='statLabel'
              >
                housing units razed
              </text>

              <rect
                width={ widths.standard }
                height={20}
                x={0}
                y={20}
                fill='maroon'
                transform='translate(120)'
              />
              { this._label('standard', (this.props.houses_standard/(this.props.houses_sub_standard + this.props.houses_standard)), widths.standard / 2) }

              <rect
                width={ widths.substandard }
                height={20}
                x={ widths.standard}
                y={20}
                fill='#008080'
                transform='translate(120)'
              />
              { this._label('substandard', (this.props.houses_sub_standard/(this.props.houses_sub_standard + this.props.houses_standard)), widths.standard + widths.substandard / 2) }

            </g>
          </svg> : ''
        }
         
        { (false && acres > 0) ? 
          <svg
            { ...DimensionsStore.getProjectStatsOverallDimensions() }
            className='projectStat'
          >
            <g transform='translate(50)'>
              <text 
                x={50}
                y={25}
                className='stat'
              >
                { Math.round(acres * 10)/10 }
              </text>
              <text 
                x={50}
                y={45}
                className='statLabel'
              >
                acres redeveloped
              </text>

              <rect
                width={ widths.residential }
                height={20}
                x={0}
                y={20}
                fill='#8b4600'
                transform='translate(120)'
              />
              { this._label('residential', this.props.reuse_residential/acres, widths.residential / 2) }

              <rect
                width={ widths.commercial }
                height={20}
                x={ widths.residential}
                y={20}
                fill='#00008b'
                transform='translate(120)'
              />
              { this._label('commercial', this.props.reuse_commercial/acres, widths.residential + widths.commercial / 2, (widths.residential > 100) ? 'sub' : 'super') }

              <rect
                width={ widths.industrial }
                height={20}
                x={ widths.residential + widths.commercial }
                y={20}
                fill='#8b8b00'
                transform='translate(120)'
              />
              { this._label('industrial', this.props.reuse_industrial/acres, widths.residential + widths.commercial + widths.industrial / 2, (true || (widths.residential >= 100 && widths.commercial <= 100 && widths.commercial >= 10) || (widths.residential < 100 && widths.commercial > 100)) ? 'super' : 'sub') }

              <rect
                width={ widths.public }
                height={20}
                x={ widths.residential + widths.commercial + widths.industrial }
                y={20}
                fill='#8b008b'
                transform='translate(120)'
              />
              { this._label('public', this.props.reuse_public/acres, widths.residential + widths.commercial + widths.industrial + widths.public / 2) }
            </g>
          </svg> : ''
        }

        { (false && this.props.funding_dispursed) ?
          <svg
            { ...DimensionsStore.getProjectStatsOverallDimensions() }
            className='projectStat'
          >
            <g transform='translate(50)'>
              <text 
                x={50}
                y={25}
                className='stat'
              >
                {'$' + this.props.funding_dispursed.toLocaleString()}
              </text>
              <text 
                x={50}
                y={45}
                className='statLabel'
              >
                in federal funding
              </text>
            </g>
          </svg>: ''
        }
      </div>
    );
  }

}