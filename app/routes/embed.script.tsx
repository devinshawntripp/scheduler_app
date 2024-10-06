import { LoaderFunction } from '@remix-run/node';

export const loader: LoaderFunction = async ({ request }) => {
  const script = `
    (function() {
      var iframe = document.createElement('iframe');
      iframe.src = '${process.env.APP_URL}/embed/scheduler?userId=' + encodeURIComponent(USER_ID) + '&apiKey=' + encodeURIComponent(API_KEY);
      iframe.style.width = '100%';
      iframe.style.height = '600px';
      iframe.style.border = 'none';
      document.getElementById('scheduler-container').appendChild(iframe);
    })();
  `;

  return new Response(script, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
};