const passwordForm = document.querySelector('#passwordForm');
const userPassword = document.querySelector('#password');


const params = new URLSearchParams(window.location.search)
const email = params.get('email');
const token = params.get('token');


passwordForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (userPassword) {
    fetch(`/api/v1/user/resetPassword?token=${token}&email=${email}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({password: userPassword.value}),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        document.body.innerHTML = `<h1>PASSWORD UPDATED!!!</h1>`
      })
      .catch((error) => {
        console.error('Error:', error);
        document.body.innerHTML = `<h1>THERE WAS A BIG FAT ERROR!!</h1>`
      });
  }
});
