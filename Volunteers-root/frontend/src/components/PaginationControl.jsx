import { Pagination, Button } from 'antd';

function PaginationControl({
                               currentPage,
                               totalPages,
                               onChangePage,
                               onLoadMore,
                               isLoading,
                               showLoadMore = true
                           }) {
    if (totalPages <= 1) return null;

    return (
        <div style={{ marginTop: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <Pagination
                    current={currentPage}
                    total={totalPages * 10}
                    pageSize={10}
                    showSizeChanger={false}
                    onChange={onChangePage}
                />
            </div>
        </div>
    );
}

export default PaginationControl;
