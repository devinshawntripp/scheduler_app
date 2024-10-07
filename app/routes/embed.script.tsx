import { LoaderFunction } from '@remix-run/node';

export const loader: LoaderFunction = async ({ request }) => {
  const script = `
    function initScheduler(container, userId, apiKey) {
      var iframe = document.createElement('iframe');
      iframe.src = '${process.env.APP_URL}/embed/scheduler?userId=' + encodeURIComponent(userId) + '&apiKey=' + encodeURIComponent(apiKey);
      iframe.style.width = '100%';
      iframe.style.height = '600px';
      iframe.style.border = 'none';
      iframe.style.background = 'transparent';
      iframe.allowTransparency = 'true';
      iframe.setAttribute('allowtransparency', 'true');
      container.appendChild(iframe);

      window.addEventListener('message', function(event) {
        if (event.origin !== '${process.env.APP_URL}') return;
        if (event.data.type === 'setHeight') {
          iframe.style.height = event.data.height + 'px';
        }
      }, false);
    }
  `;

  return new Response(script, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
};