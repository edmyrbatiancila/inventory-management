import { PaginatedResponse } from "@/types";
import { Button } from "../ui/button";
import { router } from "@inertiajs/react";

interface IPagination<T> {
    data: PaginatedResponse<T>;
}

const Pagination = ({ data }: IPagination<any>) => {
    return (
        <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
                Showing { data.from } to { data.to } of { data.total } results
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={ !data.prev_page_url }
                    onClick={() => {
                        if (data.prev_page_url) {
                            router.visit(data.prev_page_url);
                        }
                    }}
                >
                    Previous
                </Button>

                <span className="text-sm text-gray-600">
                    Page { data.current_page } of { data.last_page }
                </span>
                
                <Button
                    variant="outline"
                    size="sm"
                    disabled={ !data.next_page_url }
                    onClick={() => {
                        if (data.next_page_url) {
                            router.visit(data.next_page_url);
                        }
                    }}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

export default Pagination;