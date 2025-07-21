-- Apenas configurar REPLICA IDENTITY para as tabelas
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;