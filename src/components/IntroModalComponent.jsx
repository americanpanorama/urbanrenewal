import React, { PropTypes } from 'react';

/**
 * The new (Summer 2016) intro modal.
 * This is distinct from the IntroManager "intro",
 * which acts more like a series of walkthrough overlays.
 */
export default class IntroModal extends React.Component {

  constructor (props) {

    super(props);

    this.dismissIntro = this.dismissIntro.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    this.state = this.getDefaultState();

  }

  componentWillMount () {

    let img = new Image(),
      onload = (event) => {
        img.removeEventListener('load', onload);
        this.setState({
          coverImgLoaded: true
        });
      };

    img.addEventListener('load', onload);
    img.src = IntroModal.coverImgPath;

  }

  getDefaultState () {

    return {
      pageIndex: 0
    };

  }

  setPage (pageIndex) {

    pageIndex = Math.max(0, Math.min(pageIndex, 1));
    this.setState({
      pageIndex
    });

  }

  dismissIntro () {

    if (this.props.onDismiss) this.props.onDismiss(this.refs.muteIntroInput.checked);

  }

  handleInputChange () {

    this.refs.muteIntroLabel.classList.toggle('checked', this.refs.muteIntroInput.checked);

  }



  // ============================================================ //
  // Lifecycle
  // ============================================================ //

  render () {

    if (this.state.pageIndex === 0) {

      return (
        <div className='intro-modal'>
          <div className='page p0'>
            <div className='title-block'>
              <h1>Renewing Inequality</h1>
              <h3>Urban Renewal, Family Displacements, and Race 1955-1966</h3>
            </div>
            <img src={ './static/aurora_vargas_being_removed.jpg' } className={ this.state.coverImgLoaded ? '' : 'loading' } />
            <p>For a quarter century the federal government provided funding for cities large and small to clear "blighted" slums to clear land for public housing, highways, industry. and commerce. Through this program they displaced hundreds of thousands of families from their homes and neighborhoods. <cite>Renewing Inequality</cite> visualizes those displacements and urban renewal more generally.</p>
            <div className='intro-modal-button' onClick={ () => this.setPage(1) }>Next</div>
          </div>
        </div>
      );

    } else {

      return (
        <div className='intro-modal'>
          <div className='page p1'>
            <div className='title-block'>
              <h3>how to use</h3>
              <h2>this map</h2>
            </div>
            <div className='content'>
              <ol>
                <li>
                  <div className='ordinal'>1</div>
                  <div className='item'>
                    <p>Compare displacements across the country, with circles representing cities where size indicates displacments and color race.</p>
                    <object data='./static/intro-national.svg' type="image/svg+xml" />
                  </div>
                </li>
                <li className='wider'>
                  <div className='ordinal'>2</div>
                  <div className='item'>
                    <p>City views include project boundaries and poverty and racial data as available.</p>
                    <object data='./static/intro-city.svg' type="image/svg+xml" />
                  </div>
                </li>
                <li>
                  <div className='ordinal descender'>3</div>
                  <div className='item'>
                    <p>The barchart can be used to select a particular year.</p>
                    <object data='./static/intro-timeline.svg' type="image/svg+xml" />
                  </div>
                </li>
                <li className='wider'>
                  <div className='ordinal descender'>4</div>
                  <div className='item'>
                    <p>Inspect projects to see details about funding, housing units raised, zoning, and displacements.</p>
                    <object data='./static/intro-project.svg' type="image/svg+xml" />
                  </div>
                </li>
              </ol>
            </div>
            <p className='map-desc'></p>
            <div className='intro-modal-button' onClick={ this.dismissIntro }>Enter</div>
            <div className='footer'>
              <div onClick={ () => this.setPage(0) }>&lt; back</div>
              <label onChange={ this.handleInputChange } ref='muteIntroLabel'><input type='checkbox' ref='muteIntroInput' />do not show again</label>
            </div>
          </div>
        </div>
      );

    }

  }

}
