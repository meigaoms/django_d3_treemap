$(document).ready(function() {
  $('a[href="' + location.pathname + '"]').closest('li').addClass('active'); 
  $('li.active').removeClass('active');
  $('a[href="' + location.pathname + '"]').closest('li').addClass('active'); 
});