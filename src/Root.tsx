import { DataSource } from "typeorm/browser";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  SafeAreaView,
} from "react-native";

import { Post } from "./entities/post";
import { Author } from "./entities/author";
import { Category } from "./entities/category";
import { useEffect, useRef, useState } from "react";

const DB = new DataSource({
  database: "expo",
  driver: require("expo-sqlite"),
  entities: [Category, Author, Post],
  synchronize: true,
  type: "expo",
});

export default function App() {
  const connection = useRef<DataSource>();

  const getConnection = async () => {
    if (!connection.current) {
      connection.current = await DB.initialize();
    }

    return connection.current;
  };

  const [data, setData] = useState({
    author: "",
    category: "",
    title: "",
    content: "",
  });

  const [error, setError] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    getSavedPosts();
  }, []);

  const getSavedPosts = async () => {
    const posts = (
      await (await getConnection()).getRepository(Post).find()
    ).reverse();

    if (posts) {
      setPosts(posts);
    }
  };

  const handleInput = (name: keyof typeof data) => {
    return {
      value: data[name],
      onChangeText: (value: string) => {
        setData((prev) => ({
          ...prev,
          [name]: value,
        }));
      },
    };
  };

  const onPress = async () => {
    const { author, category, title, content } = data;
    if (!author || !category || !title || !content) {
      setError(true);
      return;
    }

    const source = await getConnection();

    const _category = new Category();
    _category.name = category;

    const _author = new Author();
    _author.name = author;

    const _post = new Post();
    _post.title = title;
    _post.content = content;

    _post.categories = [_category];
    _post.author = _author;

    const postRepository = source.getRepository(Post);
    await postRepository.save(_post);

    getSavedPosts();

    setData({
      title: "",
      author: "",
      category: "",
      content: "",
    });
    setError(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="Enter Author"
          {...handleInput("author")}
        />
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="Enter Category"
          {...handleInput("category")}
        />
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="Enter Post title"
          {...handleInput("title")}
        />
        <TextInput
          multiline
          numberOfLines={4}
          placeholder="Enter Post content"
          style={[styles.input, styles.textarea, error && styles.inputError]}
          {...handleInput("content")}
        />
        <Pressable onPress={onPress} style={styles.saveButton}>
          <Text>Save Post</Text>
        </Pressable>
      </View>

      {posts.length ? (
        <ScrollView contentContainerStyle={styles.posts}>
          <View style={styles.row}>
            <Text style={[styles.td, styles.th]}>ID</Text>
            <Text style={[styles.td, styles.title, styles.th]}>Title</Text>
            <Text style={[styles.td, styles.post, styles.th]}>Content</Text>
          </View>
          {posts.map((post) => {
            return (
              <View key={post.id}>
                <View style={styles.row}>
                  <Text style={styles.td}>{post.id}</Text>
                  <Text style={[styles.td, styles.title]} numberOfLines={2}>
                    {post.title}
                  </Text>
                  <Text style={[styles.td, styles.post]} numberOfLines={2}>
                    {post.content}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    marginHorizontal: 10,
  },
  input: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#d3d3d3",
    marginBottom: 10,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "red",
  },
  saveButton: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
    backgroundColor: "#d3d3d3",
  },
  posts: {
    marginHorizontal: 10,
    borderColor: "grey",
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: "row",
  },
  textarea: {
    height: 80,
  },
  th: {
    color: "#000",
    backgroundColor: "#d3d3d3",
  },
  td: {
    minWidth: 40,
    padding: 10,
    borderColor: "#d3d3d3",
    borderWidth: StyleSheet.hairlineWidth,
  },
  id: {},
  title: {
    flex: 1,
  },
  post: {
    flex: 2,
  },
});
