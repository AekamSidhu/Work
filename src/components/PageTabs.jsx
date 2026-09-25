import Icon from './Icon.jsx';

export default function PageTabs({ letter }) {
  const { pages, activeIndex, activePage, setActive, addPage, removePage } = letter;

  const confirmRemove = () => {
    if (window.confirm(`Delete page ${activeIndex + 1}? Its text will be lost.`)) removePage(activePage.id);
  };

  return (
    <div className="page-tabs">
      <div className="page-tabs-list" role="tablist" aria-label="Pages">
        {pages.map((page, i) => (
          <button
            key={page.id}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            className="page-tab"
            onClick={() => setActive(page.id)}
          >
            Page {i + 1}
          </button>
        ))}
        <button type="button" className="page-tab page-tab-add" onClick={addPage}>
          <Icon name="plus" size={16} /> Add page
        </button>
      </div>
      {pages.length > 1 && (
        <button type="button" className="link-button link-danger" onClick={confirmRemove}>
          <Icon name="trash" size={15} /> Delete page {activeIndex + 1}
        </button>
      )}
    </div>
  );
}
