import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { Plus, Pencil, Trash2, Sprout, Tag } from "lucide-react";

import { productsAPI } from "@/shared/api";
import { open } from "@/features/modal/store/modal.slice";
import Button from "@/shared/components/ui/button/Button";
import ModalWrapper from "@/shared/components/ui/ModalWrapper";
import ProductForm from "../components/ProductForm";
import VarietyForm from "../components/VarietyForm";

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsAPI.getAll().then((res) => res.data),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => productsAPI.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Mahsulot o'chirildi!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "O'chirishda xatolik");
    },
  });

  const deleteVarietyMutation = useMutation({
    mutationFn: ({ productId, varId }) => productsAPI.removeVariety(productId, varId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Nav o'chirildi!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "O'chirishda xatolik");
    },
  });

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mahsulotlar</h1>
          <p className="text-sm text-gray-500">Mahsulotlar va ularning navlarini boshqarish</p>
        </div>
        <Button
          onClick={() => dispatch(open({ modal: "createProduct" }))}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Yangi mahsulot
        </Button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products grid */}
      {!isLoading && products.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Sprout className="size-10 mx-auto mb-3 text-gray-300" />
          <p>Hozircha mahsulotlar yo'q</p>
          <p className="text-sm mt-1">Yangi mahsulot qo'shish uchun yuqoridagi tugmani bosing</p>
        </div>
      )}

      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-xl border p-4 space-y-3">
              {/* Product header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-gradient-to-br from-lime-400 to-green-700 flex items-center justify-center">
                    <Sprout className="size-4 text-white" />
                  </div>
                  <p className="font-semibold">{product.name}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() =>
                      dispatch(open({ modal: "editProduct", data: { _id: product._id, name: product.name } }))
                    }
                    variant="ghost"
                    size="icon"
                    className="p-1"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      if (confirm("Mahsulotni o'chirishni tasdiqlaysizmi?"))
                        deleteProductMutation.mutate(product._id);
                    }}
                    variant="ghost"
                    size="icon"
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Varieties */}
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">
                  Navlar ({product.varieties?.length || 0})
                </p>
                {product.varieties?.length === 0 && (
                  <p className="text-xs text-gray-400">Hali nav qo'shilmagan</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {product.varieties?.map((v) => (
                    <span
                      key={v._id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800"
                    >
                      <Tag className="size-2.5" />
                      {v.name}
                      <button
                        onClick={() =>
                          dispatch(
                            open({
                              modal: "editVariety",
                              data: {
                                productId: product._id,
                                _id: v._id,
                                name: v.name,
                                mode: "edit",
                              },
                            })
                          )
                        }
                        className="text-green-600 hover:text-green-800 ml-0.5"
                        aria-label="Navni tahrirlash"
                      >
                        <Pencil className="size-2.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Navni o'chirishni tasdiqlaysizmi?"))
                            deleteVarietyMutation.mutate({ productId: product._id, varId: v._id });
                        }}
                        className="text-red-400 hover:text-red-600"
                        aria-label="Navni o'chirish"
                      >
                        <Trash2 className="size-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Add variety */}
              <button
                onClick={() =>
                  dispatch(open({ modal: "addVariety", data: { productId: product._id, mode: "create" } }))
                }
                className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-800 font-medium transition-colors"
              >
                <Plus className="size-3.5" /> Nav qo'shish
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ModalWrapper name="createProduct" title="Yangi mahsulot">
        <ProductForm mode="create" />
      </ModalWrapper>

      <ModalWrapper name="editProduct" title="Mahsulotni tahrirlash">
        <ProductForm mode="edit" />
      </ModalWrapper>

      <ModalWrapper name="addVariety" title="Nav qo'shish">
        <VarietyForm mode="create" />
      </ModalWrapper>

      <ModalWrapper name="editVariety" title="Navni tahrirlash">
        <VarietyForm mode="edit" />
      </ModalWrapper>
    </div>
  );
};

export default ProductsPage;
