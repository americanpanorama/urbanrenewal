import React, { PropTypes } from 'react';

export default class ContactUs extends React.Component {

  constructor () {
    super();
  }

  handleSubmit (evt) {
    evt.preventDefault();

    var xhr = new XMLHttpRequest(),
      params = [
        encodeURIComponent('Form_ID') + '=' + encodeURIComponent('renewal_contact_us'),
        encodeURIComponent('Owner_ID') + '=' + encodeURIComponent('rnelson2'),
        encodeURIComponent('send_submit') + '=' + encodeURIComponent('data'),
        encodeURIComponent('send_submit_to') + '=' + encodeURIComponent('rnelson2'),
        encodeURIComponent('project') + '=' + encodeURIComponent('renewal_contact_form'),
        encodeURIComponent('name') + '=' + encodeURIComponent(evt.target.name.value),
        encodeURIComponent('email') + '=' + encodeURIComponent(evt.target.email.value),
        encodeURIComponent('message') + '=' + encodeURIComponent(evt.target.message.value)
      ].join('&');

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        document.getElementsByClassName("contactUsForm")[0].innerHTML = "<p>We have received your message. Thank you for contacting us.</p>";
      }
    };

    xhr.open("POST", 'https://webapps.richmond.edu/URPoster/URPoster.php');
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);


    return false;

  }

  render () {
    return (
      <div className='contactUs'>
        <button className='close' onClick={ this.props.onContactUsToggle }><span>×</span></button>
        <h2>Contact Us</h2>
        <div className='contactUsForm'>
          <p>We very much welcome feedback, comments, and suggestions.</p>
          <form name='redlining_contact_us' onSubmit={ this.handleSubmit }>
            <label htmlFor='name'>Name</label>
            <input type='text' maxLength={50} name='name' />
            <label htmlFor='email'>Email</label>
            <input type='text' maxLength={50} name='email' />
            <label htmlFor='email'>Message</label>
            <textarea name="message" cols={60} />
            <input type="submit" />
          </form>
        </div>
      </div>
    );
  }
}