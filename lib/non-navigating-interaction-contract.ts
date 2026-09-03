const guardScript = `<script id="compose-non-navigating-interactions">
(()=>{const selector='a,[role="link"],button,input[type="submit"],input[type="button"],input[type="image"]';const findTarget=event=>event.target instanceof Element?event.target.closest(selector):null;const preventNavigation=event=>{const target=findTarget(event);if(!target)return;if(target.matches('a,[role="link"],button[type="submit"],input[type="submit"],input[type="image"]'))event.preventDefault()};document.addEventListener('click',preventNavigation,true);document.addEventListener('auxclick',preventNavigation,true);document.addEventListener('submit',event=>event.preventDefault(),true);document.querySelectorAll('a').forEach(link=>{link.removeAttribute('target');link.setAttribute('data-compose-navigation','disabled')});window.open=()=>null;document.body.dataset.composeNavigation='disabled'})();
</script>`;

/**
 * Generated pages are visual deliverables, not connected applications.
 * Keep local UI interactions working while suppressing every navigation and
 * form submission that could move the preview or a downloaded HTML document.
 */
export function applyNonNavigatingInteractionContract(html: string) {
  if (html.includes('id="compose-non-navigating-interactions"')) return html;
  return html.replace(/<\/body>/i, `${guardScript}</body>`);
}
