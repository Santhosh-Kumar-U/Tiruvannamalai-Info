function showSubmenu(category) {
    const mainGrid = document.getElementById('main-places-grid');
    const submenus = document.querySelectorAll('.submenu-container');
    const targetSubmenu = document.getElementById(category + '-submenu');

    if (mainGrid && targetSubmenu) {
        // Hide Main Grid
        mainGrid.style.display = 'none';

        // Hide all submenus first
        submenus.forEach(menu => {
            menu.classList.remove('active');
            menu.style.display = 'none';
        });

        // Show target submenu
        targetSubmenu.style.display = 'block';
        setTimeout(() => {
            targetSubmenu.classList.add('active');
        }, 10);

        // Scroll to top of section
        const navbarHeight = document.querySelector('nav').offsetHeight || 80;
        const targetPos = targetSubmenu.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;

        window.scrollTo({
            top: targetPos,
            behavior: 'smooth'
        });
    }
}

function showMainGrid() {
    const mainGrid = document.getElementById('main-places-grid');
    const submenus = document.querySelectorAll('.submenu-container');

    if (mainGrid) {
        // Hide absolute submenus
        submenus.forEach(menu => {
            menu.classList.remove('active');
            menu.style.display = 'none';
        });

        // Show Main Grid
        mainGrid.style.display = 'grid';

        // Scroll back to categories
        const categoryAnchor = document.querySelector('.category-card');
        if (categoryAnchor) {
            const navbarHeight = document.querySelector('nav').offsetHeight || 80;
            const targetPos = categoryAnchor.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 40;
            window.scrollTo({
                top: targetPos,
                behavior: 'smooth'
            });
        }
    }
}

// Ensure submenus are hidden on load
document.addEventListener('DOMContentLoaded', function () {
    const submenus = document.querySelectorAll('.submenu-container');
    submenus.forEach(menu => {
        menu.style.display = 'none';
    });
});